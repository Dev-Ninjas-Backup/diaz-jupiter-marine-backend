import { AppError } from '@/common/error/handle-error.app';
import { HandleError } from '@/common/error/handle-error.decorator';
import {
  successPaginatedResponse,
  successResponse,
} from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from 'generated/client';
import { AiQueryDto, YachtBrokerFilterDto } from './yachtbroker.dto';

@Injectable()
export class YachtBrokerService {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to get YachtBroker listings')
  async getAll(query: YachtBrokerFilterDto) {
    const {
      page = 1,
      limit = 10,
      manufacturer,
      model,
      year,
      condition,
      category,
      city,
      state,
      search,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.YachtBrokerListingWhereInput = {};

    if (manufacturer) {
      where.manufacturer = { contains: manufacturer, mode: 'insensitive' };
    }
    if (model) {
      where.model = { contains: model, mode: 'insensitive' };
    }
    if (year) {
      where.year = parseInt(year, 10);
    }
    if (condition) {
      where.condition = { contains: condition, mode: 'insensitive' };
    }
    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }
    if (state) {
      where.state = { contains: state, mode: 'insensitive' };
    }
    if (search) {
      where.OR = [
        { vesselName: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [listings, total] = await Promise.all([
      this.prisma.client.yachtBrokerListing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { lastSyncedAt: 'desc' },
      }),
      this.prisma.client.yachtBrokerListing.count({ where }),
    ]);

    return successPaginatedResponse(
      listings,
      { page, limit, total },
      'YachtBroker listings fetched successfully',
    );
  }

  @HandleError('Failed to get YachtBroker AI-formatted listings')
  async getAiFormat(query: AiQueryDto) {
    const { page = 1, limit = 10 } = query;

    const [listings, total] = await Promise.all([
      this.prisma.client.yachtBrokerListing.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { lastSyncedAt: 'desc' },
      }),
      this.prisma.client.yachtBrokerListing.count(),
    ]);

    const data = listings.map((listing) => {
      const engines = Array.isArray(listing.engines)
        ? (listing.engines as Record<string, unknown>[]).map((eng) => ({
            Make: eng.make ?? null,
            Model: eng.model ?? null,
            Fuel: eng.fuelType ?? null,
            EnginePower:
              eng.powerHp != null ? `${eng.powerHp}|horsepower` : null,
            Type: eng.type ?? null,
            Year: eng.year ?? null,
            Hours: eng.hours ?? null,
          }))
        : [];

      const totalHp =
        (listing.engines as Record<string, unknown>[] | null)?.reduce(
          (sum, eng) => sum + (Number(eng.powerHp) || 0),
          0,
        ) ?? 0;

      const displayPicture = listing.displayPicture as Record<
        string,
        unknown
      > | null;
      const imageUri =
        displayPicture?.large ??
        displayPicture?.hd ??
        displayPicture?.medium ??
        null;

      const additionalDescriptions: string[] = [];
      if (listing.summary) additionalDescriptions.push(listing.summary);
      if (listing.notableUpgrades)
        additionalDescriptions.push(listing.notableUpgrades);

      return {
        Source: 'inventory',
        DocumentID: listing.externalId,
        LastModificationDate: listing.lastSyncedAt.toISOString().split('T')[0],
        ItemReceivedDate: listing.createdAt.toISOString().split('T')[0],
        OriginalPrice:
          listing.priceUsd != null ? `${listing.priceUsd} USD` : null,
        Price:
          listing.priceUsd != null
            ? `${listing.priceUsd.toFixed(2)} USD`
            : null,
        BoatLocation: {
          BoatCityName: listing.city ?? null,
          BoatCountryID: listing.country ?? null,
          BoatStateCode: listing.state ?? null,
        },
        MakeString: listing.manufacturer ?? null,
        ModelYear: listing.year ?? null,
        Model: listing.model ?? null,
        ...(listing.vesselName ? { ListingTitle: listing.vesselName } : {}),
        BeamMeasure: listing.beamFeet != null ? `${listing.beamFeet} ft` : null,
        TotalEnginePowerQuantity: totalHp > 0 ? `${totalHp} hp` : null,
        NominalLength:
          listing.displayLengthFeet != null
            ? `${listing.displayLengthFeet} ft`
            : null,
        LengthOverall:
          listing.displayLengthFeet != null
            ? `${listing.displayLengthFeet} ft`
            : null,
        Engines: engines,
        GeneralBoatDescription: listing.description
          ? [listing.description]
          : [],
        AdditionalDetailDescription: additionalDescriptions,
        Images: imageUri
          ? {
              Priority: '0',
              Caption: null,
              Uri: imageUri,
            }
          : null,
      };
    });

    return successPaginatedResponse(
      data,
      { page, limit, total },
      'Boats found successfully from Inventory API',
    );
  }

  @HandleError('Failed to get YachtBroker listing')
  async getOne(externalId: string) {
    const listing = await this.prisma.client.yachtBrokerListing.findUnique({
      where: { externalId },
    });

    if (!listing) {
      throw new AppError(
        HttpStatus.NOT_FOUND,
        `YachtBroker listing not found: ${externalId}`,
      );
    }

    return successResponse(listing, 'YachtBroker listing fetched successfully');
  }
}
