import { ENVEnum } from '@/common/enum/env.enum';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Prisma } from 'generated/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface BoatsComSyncResult {
  added: number;
  updated: number;
  total: number;
}

@Injectable()
export class BoatsComSyncService {
  private readonly logger = new Logger(BoatsComSyncService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.apiKey = this.config.getOrThrow<string>(ENVEnum.API_BOATS_KEY);
    this.baseUrl = this.config.getOrThrow<string>(ENVEnum.BOATS_COM_API_URL);
  }

  private parsePrice(value: unknown): number | null {
    if (value === null || value === undefined) return null;
    const str = String(value)
      .replace(/\s*USD\s*/gi, '')
      .trim();
    const parsed = parseFloat(str);
    return isNaN(parsed) ? null : parsed;
  }

  private toJsonOrNull(
    value: unknown,
  ): Prisma.InputJsonValue | typeof Prisma.JsonNull {
    if (value === null || value === undefined) return Prisma.JsonNull;
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }

  private mapBoat(boat: Record<string, unknown>) {
    const location = (boat.BoatLocation ?? {}) as Record<string, unknown>;

    const images = Array.isArray(boat.Images)
      ? this.toJsonOrNull(
          boat.Images.map((img: Record<string, unknown>) => ({
            uri: img.Uri,
            priority: img.Priority,
            caption: img.Caption,
          })),
        )
      : Prisma.JsonNull;

    const videos = boat.Videos
      ? this.toJsonOrNull({
          url: (boat.Videos as Record<string, unknown>).url ?? [],
          title: (boat.Videos as Record<string, unknown>).title ?? [],
          thumbnailUrl:
            (boat.Videos as Record<string, unknown>).thumbnailUrl ?? [],
        })
      : Prisma.JsonNull;

    const engines = Array.isArray(boat.Engines)
      ? this.toJsonOrNull(
          boat.Engines.map((eng: Record<string, unknown>) => ({
            make: eng.Make,
            model: eng.Model,
            fuel: eng.Fuel,
            enginePower: eng.EnginePower,
            type: eng.Type,
            year: eng.Year,
            hours: eng.Hours,
            boatEngineLocationCode: eng.BoatEngineLocationCode,
            propellerType: eng.PropellerType,
          })),
        )
      : Prisma.JsonNull;

    const description = Array.isArray(boat.GeneralBoatDescription)
      ? (boat.GeneralBoatDescription as string[]).join('\n')
      : '';

    const additionalDescription = Array.isArray(
      boat.AdditionalDetailDescription,
    )
      ? (boat.AdditionalDetailDescription as string[]).join('\n')
      : '';

    return {
      documentId: String(boat.DocumentID),
      listingTitle: (boat.ListingTitle as string) ?? null,
      makeString: (boat.MakeString as string) ?? null,
      model: (boat.Model as string) ?? null,
      modelYear: boat.ModelYear ? Number(boat.ModelYear) : null,
      price: this.parsePrice(boat.Price),
      originalPrice: this.parsePrice(boat.OriginalPrice),
      saleClassCode: (boat.SaleClassCode as string) ?? null,
      boatCategoryCode: (boat.BoatCategoryCode as string) ?? null,
      boatHullMaterialCode: (boat.BoatHullMaterialCode as string) ?? null,
      nominalLength: boat.NominalLength
        ? parseFloat(String(boat.NominalLength))
        : null,
      lengthOverall: boat.LengthOverall
        ? parseFloat(String(boat.LengthOverall))
        : null,
      beamMeasure: boat.BeamMeasure
        ? parseFloat(String(boat.BeamMeasure))
        : null,
      numberOfEngines: boat.NumberOfEngines
        ? Number(boat.NumberOfEngines)
        : null,
      headsCountNumeric: boat.HeadsCountNumeric
        ? Number(boat.HeadsCountNumeric)
        : null,
      boatName: (boat.BoatName as string) ?? null,
      description,
      additionalDescription,
      city: (location.BoatCityName as string) ?? null,
      state: (location.BoatStateCode as string) ?? null,
      country: (location.BoatCountryID as string) ?? null,
      stockNumber: (boat.StockNumber as string) ?? null,
      boatHullId: (boat.BoatHullID as string) ?? null,
      fuelTankCapacity: boat.FuelTankCapacityMeasure
        ? String(boat.FuelTankCapacityMeasure)
        : null,
      dryWeightMeasure: boat.DryWeightMeasure
        ? String(boat.DryWeightMeasure)
        : null,
      bridgeClearance: boat.BridgeClearanceMeasure
        ? String(boat.BridgeClearanceMeasure)
        : null,
      maxPassengers: boat.MaximumNumberOfPassengersNumeric
        ? Number(boat.MaximumNumberOfPassengersNumeric)
        : null,
      lastModificationDate: (boat.LastModificationDate as string) ?? null,
      itemReceivedDate: (boat.ItemReceivedDate as string) ?? null,
      salesStatus: (boat.SalesStatus as string) ?? null,
      images,
      videos,
      engines,
      lastSyncedAt: new Date(),
    };
  }

  private get browserHeaders() {
    return {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'cross-site',
    };
  }

  async syncAll(): Promise<BoatsComSyncResult> {
    this.logger.log('[BoatsComSync] Starting full sync...');
    let added = 0;
    let updated = 0;
    let total = 0;
    const pageSize = 100;
    let start = 0;
    let hasMore = true;

    while (hasMore) {
      try {
        const url = `${this.baseUrl}?key=${this.apiKey}&rows=${pageSize}&start=${start}&salesstatus=active`;
        const { data } = await axios.get(url, { headers: this.browserHeaders });

        const results: Record<string, unknown>[] = data.results ?? [];
        const numResults: number = data.numResults ?? 0;

        if (total === 0) {
          total = numResults;
          this.logger.log(`[BoatsComSync] Total records to sync: ${total}`);
        }

        if (results.length === 0) {
          hasMore = false;
          break;
        }

        for (const boat of results) {
          if (!boat.DocumentID) continue;

          const mapped = this.mapBoat(boat);
          const documentId = mapped.documentId;

          const existing = await this.prisma.client.boatsComListing.findUnique({
            where: { documentId },
            select: { id: true },
          });

          await this.prisma.client.boatsComListing.upsert({
            where: { documentId },
            create: mapped,
            update: { ...mapped },
          });

          if (existing) {
            updated++;
          } else {
            added++;
          }
        }

        start += pageSize;

        if (start >= numResults || results.length < pageSize) {
          hasMore = false;
        }
      } catch (error) {
        this.logger.error(
          `[BoatsComSync] Error fetching page at start=${start}`,
          error,
        );
        break;
      }
    }

    this.logger.log(
      `[BoatsComSync] Done. Added: ${added}, Updated: ${updated}, Total: ${total}`,
    );
    return { added, updated, total };
  }

  async importFromFrontend(
    results: Record<string, unknown>[],
  ): Promise<BoatsComSyncResult> {
    this.logger.log(
      `[BoatsComSync] Importing ${results.length} boats from frontend`,
    );
    let added = 0;
    let updated = 0;

    for (const boat of results) {
      if (!boat.DocumentID) continue;

      try {
        const mapped = this.mapBoat(boat);
        const documentId = mapped.documentId;

        const existing = await this.prisma.client.boatsComListing.findUnique({
          where: { documentId },
          select: { id: true },
        });

        await this.prisma.client.boatsComListing.upsert({
          where: { documentId },
          create: mapped,
          update: { ...mapped },
        });

        if (existing) {
          updated++;
        } else {
          added++;
        }
      } catch (error) {
        this.logger.error(
          `[BoatsComSync] Failed to import boat ${boat.DocumentID}`,
          error,
        );
      }
    }

    const total = added + updated;
    this.logger.log(
      `[BoatsComSync] Import done. Added: ${added}, Updated: ${updated}, Total: ${total}`,
    );
    return { added, updated, total };
  }

  async syncSingle(documentId: string): Promise<BoatsComSyncResult> {
    this.logger.log(`[BoatsComSync] Syncing single boat: ${documentId}`);
    let added = 0;
    let updated = 0;

    try {
      const url = `${this.baseUrl}?key=${this.apiKey}&DocumentID=${documentId}`;
      const { data } = await axios.get(url, { headers: this.browserHeaders });

      const results: Record<string, unknown>[] = data.results ?? [];
      const boat = results[0];

      if (!boat) {
        this.logger.warn(`[BoatsComSync] Boat not found: ${documentId}`);
        return { added: 0, updated: 0, total: 0 };
      }

      const mapped = this.mapBoat(boat);

      const existing = await this.prisma.client.boatsComListing.findUnique({
        where: { documentId: mapped.documentId },
        select: { id: true },
      });

      await this.prisma.client.boatsComListing.upsert({
        where: { documentId: mapped.documentId },
        create: mapped,
        update: { ...mapped },
      });

      if (existing) {
        updated = 1;
      } else {
        added = 1;
      }
    } catch (error) {
      this.logger.error(
        `[BoatsComSync] Error syncing boat ${documentId}`,
        error,
      );
    }

    return { added, updated, total: 1 };
  }
}
