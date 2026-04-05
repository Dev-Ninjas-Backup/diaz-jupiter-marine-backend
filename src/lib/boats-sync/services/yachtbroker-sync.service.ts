import { ENVEnum } from '@/common/enum/env.enum';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Prisma } from 'generated/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface YachtBrokerSyncResult {
  added: number;
  updated: number;
  total: number;
}

/** `full` = every page (manual admin). `incremental` = pages 1 and last when DB has rows (cron). */
export type YachtBrokerSyncMode = 'full' | 'incremental';

export interface YachtBrokerSyncOptions {
  mode?: YachtBrokerSyncMode;
}

const YB_PER_PAGE = 15;
const PROGRESS_LOG_EVERY = 10;

type YachtBrokerSyncProgress = {
  processed: number;
  added: number;
  updated: number;
};

/** Normalize env URL: strip query, fix legacy api.yachtbroker.org root or /listings → /vessel */
function normalizeYachtBrokerVesselUrl(raw: string): string {
  const trimmed = raw.trim();
  const u = new URL(trimmed);
  u.hash = '';
  u.search = '';

  const host = u.hostname.toLowerCase();
  const path = u.pathname.replace(/\/$/, '') || '';

  if (host === 'api.yachtbroker.org') {
    if (path === '' || path === '/') {
      u.pathname = '/vessel';
    } else if (path === '/listings' || path.endsWith('/listings')) {
      u.pathname = path.replace(/\/listings$/, '/vessel') || '/vessel';
    }
  }

  if (
    host === 'jupitermarinesales.com' ||
    host.endsWith('.jupitermarinesales.com')
  ) {
    if (path === '/api/yachtbroker' || path.endsWith('/api/yachtbroker')) {
      u.pathname = `${path}/vessel`.replace(/\/{2,}/g, '/');
    }
  }

  return u.toString().replace(/\/$/, '');
}

@Injectable()
export class YachtBrokerSyncService {
  private readonly logger = new Logger(YachtBrokerSyncService.name);
  private readonly apiKey: string;
  private readonly brokerId: string;
  /** Full URL to the vessel listing endpoint, e.g. https://jupitermarinesales.com/api/yachtbroker/vessel */
  private readonly baseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.apiKey = this.config.getOrThrow<string>(ENVEnum.YACHTBROKER_API_KEY);
    this.brokerId = this.config.getOrThrow<string>(
      ENVEnum.YACHTBROKER_BROKER_ID,
    );
    const rawUrl = this.config.getOrThrow<string>(ENVEnum.YACHTBROKER_API_URL);
    this.baseUrl = normalizeYachtBrokerVesselUrl(rawUrl);
    if (rawUrl !== this.baseUrl) {
      this.logger.log(
        `[YachtBrokerSync] Normalized YACHTBROKER_API_URL → ${this.baseUrl}`,
      );
    }
  }

  private get browserHeaders() {
    return {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
    };
  }

  private toJsonOrNull(
    value: unknown,
  ): Prisma.InputJsonValue | typeof Prisma.JsonNull {
    if (value === null || value === undefined) return Prisma.JsonNull;
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }

  private mapVessel(vessel: Record<string, unknown>) {
    const displayPicture = vessel.DisplayPicture
      ? this.toJsonOrNull({
          large: (vessel.DisplayPicture as Record<string, unknown>).Large,
          hd: (vessel.DisplayPicture as Record<string, unknown>).HD,
          medium: (vessel.DisplayPicture as Record<string, unknown>).Medium,
          thumbnail: (vessel.DisplayPicture as Record<string, unknown>)
            .Thumbnail,
        })
      : Prisma.JsonNull;

    const galleryRaw = vessel.Gallery ?? vessel.gallery;
    const gallery = Array.isArray(galleryRaw)
      ? this.toJsonOrNull(
          (galleryRaw as Record<string, unknown>[]).map((img) => ({
            large: img.Large,
            hd: img.HD,
            medium: img.Medium,
            thumbnail: img.Thumbnail,
          })),
        )
      : Prisma.JsonNull;

    const engines = Array.isArray(vessel.Engines)
      ? this.toJsonOrNull(
          (vessel.Engines as Record<string, unknown>[]).map((eng) => ({
            make: eng.EngineMake,
            model: eng.EngineModel,
            year: eng.EngineYear,
            type: eng.EngineType,
            driveType: eng.DriveType,
            fuelType: eng.FuelType,
            hours: eng.Hours,
            powerHp: eng.PowerHP,
            powerKw: eng.PowerKW,
            serialNumber: eng.SerialNumber,
            location: eng.EngineLocation,
          })),
        )
      : Prisma.JsonNull;

    return {
      externalId: String(vessel.ID),
      manufacturer: (vessel.Manufacturer as string) ?? null,
      model: (vessel.Model as string) ?? null,
      year: vessel.Year ? Number(vessel.Year) : null,
      vesselName: (vessel.VesselName as string) ?? null,
      priceUsd: vessel.PriceUSD ? parseFloat(String(vessel.PriceUSD)) : null,
      priceHidden: Boolean(vessel.PriceHidden),
      city: (vessel.City as string) ?? null,
      state: (vessel.State as string) ?? null,
      country: (vessel.Country as string) ?? null,
      displayLengthFeet: vessel.DisplayLengthFeet
        ? parseFloat(String(vessel.DisplayLengthFeet))
        : null,
      beamFeet: vessel.BeamFeet ? parseFloat(String(vessel.BeamFeet)) : null,
      beamInch: vessel.BeamInch ? parseFloat(String(vessel.BeamInch)) : null,
      fuelType: (vessel.FuelType as string) ?? null,
      hullMaterial: (vessel.HullMaterial as string) ?? null,
      category: (vessel.Category as string) ?? null,
      condition: (vessel.Condition as string) ?? null,
      status: (vessel.Status as string) ?? null,
      description: (vessel.Description as string) ?? null,
      summary: (vessel.Summary as string) ?? null,
      notableUpgrades: (vessel.NotableUpgrades as string) ?? null,
      maxDraftFeet: vessel.MaximumDraftFeet
        ? parseFloat(String(vessel.MaximumDraftFeet))
        : null,
      cabinCount: vessel.CabinCount ? Number(vessel.CabinCount) : null,
      headCount: vessel.HeadCount ? Number(vessel.HeadCount) : null,
      engineQty: vessel.EngineQty ? Number(vessel.EngineQty) : null,
      displayPicture,
      gallery,
      engines,
      lastSyncedAt: new Date(),
    };
  }

  private assertVesselListPayload(
    data: unknown,
    context: string,
  ): {
    vessels: Record<string, unknown>[];
    lastPage: number;
    total: number;
  } {
    const root =
      data !== null &&
      typeof data === 'object' &&
      'data' in (data as object) &&
      (data as { data?: unknown }).data !== null &&
      typeof (data as { data?: unknown }).data === 'object'
        ? (data as { data: Record<string, unknown> }).data
        : (data as Record<string, unknown>);

    if (root === null || typeof root !== 'object' || Array.isArray(root)) {
      const preview =
        typeof data === 'string'
          ? data.slice(0, 120)
          : JSON.stringify(data)?.slice(0, 200);
      throw new Error(
        `[YachtBrokerSync] ${context}: expected JSON object, got ${typeof data}. Preview: ${preview}`,
      );
    }

    const rawVessels = root['V-Data'];
    if (!Array.isArray(rawVessels)) {
      throw new Error(
        `[YachtBrokerSync] ${context}: missing or invalid V-Data (got ${typeof rawVessels}). Check YACHTBROKER_API_URL points to the vessel list endpoint.`,
      );
    }

    const total = Number(root.total);
    const lastPage = Number(root.last_page);

    return {
      vessels: rawVessels as Record<string, unknown>[],
      lastPage: Number.isFinite(lastPage) && lastPage > 0 ? lastPage : 1,
      total: Number.isFinite(total) ? total : 0,
    };
  }

  private async fetchPage(page: number): Promise<{
    vessels: Record<string, unknown>[];
    lastPage: number;
    total: number;
  }> {
    const { data, status } = await axios.get(this.baseUrl, {
      headers: this.browserHeaders,
      params: {
        key: this.apiKey,
        id: this.brokerId,
        gallery: true,
        engines: true,
        generators: true,
        textblocks: true,
        media: true,
        status: 'On,Under Contract',
        page,
        per_page: YB_PER_PAGE,
      },
    });

    try {
      return this.assertVesselListPayload(data, `page ${page}`);
    } catch (e) {
      const err = e as Error;
      this.logger.error(
        `[YachtBrokerSync] Bad response HTTP ${status} for ${this.baseUrl}: ${err.message}`,
      );
      throw err;
    }
  }

  private logProgressEveryN(cumulative: YachtBrokerSyncProgress) {
    if (
      cumulative.processed > 0 &&
      cumulative.processed % PROGRESS_LOG_EVERY === 0
    ) {
      this.logger.log(
        `[YachtBrokerSync] Progress: ${cumulative.processed} vessels — added: ${cumulative.added}, updated: ${cumulative.updated}`,
      );
    }
  }

  private async upsertVessels(
    vessels: Record<string, unknown>[],
    cumulative?: YachtBrokerSyncProgress,
  ): Promise<{ added: number; updated: number }> {
    let added = 0;
    let updated = 0;

    for (const vessel of vessels) {
      if (!vessel.ID) continue;

      const mapped = this.mapVessel(vessel);
      const externalId = mapped.externalId;

      const existing = await this.prisma.client.yachtBrokerListing.findUnique({
        where: { externalId },
        select: { id: true },
      });

      await this.prisma.client.yachtBrokerListing.upsert({
        where: { externalId },
        create: mapped,
        update: { ...mapped },
      });

      if (existing) {
        updated++;
        if (cumulative) {
          cumulative.updated++;
          cumulative.processed++;
          this.logProgressEveryN(cumulative);
        }
      } else {
        added++;
        if (cumulative) {
          cumulative.added++;
          cumulative.processed++;
          this.logProgressEveryN(cumulative);
        }
      }
    }

    return { added, updated };
  }

  /**
   * - **Initial backfill** (no rows in DB): always walks every page, regardless of `mode`.
   * - **`mode: 'full'`** (default for manual admin): every page.
   * - **`mode: 'incremental'`** (default for scheduled cron): pages 1 and last only.
   */
  async syncAll(
    options?: YachtBrokerSyncOptions,
  ): Promise<YachtBrokerSyncResult> {
    const mode: YachtBrokerSyncMode = options?.mode ?? 'incremental';
    const existingCount = await this.prisma.client.yachtBrokerListing.count();
    const isInitialBootstrap = existingCount === 0;
    const useFullPagination = isInitialBootstrap || mode === 'full';

    let added = 0;
    let updated = 0;
    let apiTotal = 0;
    const progress: YachtBrokerSyncProgress = {
      processed: 0,
      added: 0,
      updated: 0,
    };

    if (useFullPagination) {
      this.logger.log(
        isInitialBootstrap
          ? '[YachtBrokerSync] Initial backfill — fetching all pages...'
          : '[YachtBrokerSync] Full sync — fetching all pages...',
      );
      let page = 1;
      let lastPage = 1;

      while (page <= lastPage) {
        const { vessels, lastPage: lp, total } = await this.fetchPage(page);
        if (page === 1) {
          lastPage = lp;
          apiTotal = total;
          this.logger.log(
            `[YachtBrokerSync] Total: ${apiTotal}, pages: ${lastPage}`,
          );
        }

        const r = await this.upsertVessels(vessels, progress);
        added += r.added;
        updated += r.updated;
        page++;
      }
    } else {
      this.logger.log(
        '[YachtBrokerSync] Incremental sync (scheduled) — pages 1 and last only...',
      );
      const first = await this.fetchPage(1);
      apiTotal = first.total;
      const lastPage = first.lastPage;

      let r = await this.upsertVessels(first.vessels, progress);
      added += r.added;
      updated += r.updated;

      if (lastPage > 1) {
        const last = await this.fetchPage(lastPage);
        r = await this.upsertVessels(last.vessels, progress);
        added += r.added;
        updated += r.updated;
      }

      this.logger.log(
        `[YachtBrokerSync] Incremental: API total ${apiTotal}, last page ${lastPage}`,
      );
    }

    this.logger.log(
      `[YachtBrokerSync] Done. Added: ${added}, Updated: ${updated}, API total: ${apiTotal}`,
    );
    return { added, updated, total: apiTotal };
  }
}
