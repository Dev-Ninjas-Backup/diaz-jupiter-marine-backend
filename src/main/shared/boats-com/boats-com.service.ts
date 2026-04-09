import { HandleError } from '@/common/error/handle-error.decorator';
import { AppError } from '@/common/error/handle-error.app';
import {
  successPaginatedResponse,
  successResponse,
} from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from 'generated/client';
import { AiQueryDto, BoatsComFilterDto } from './boats-com.dto';

@Injectable()
export class BoatsComService {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to get boats.com listings')
  async getAll(query: BoatsComFilterDto) {
    const {
      page = 1,
      limit = 10,
      make,
      model,
      year,
      condition,
      city,
      state,
      search,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BoatsComListingWhereInput = {};

    if (make) {
      where.makeString = { contains: make, mode: 'insensitive' };
    }
    if (model) {
      where.model = { contains: model, mode: 'insensitive' };
    }
    if (year) {
      where.modelYear = parseInt(year, 10);
    }
    if (condition) {
      where.saleClassCode = { contains: condition, mode: 'insensitive' };
    }
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }
    if (state) {
      where.state = { contains: state, mode: 'insensitive' };
    }
    if (search) {
      where.OR = [
        { listingTitle: { contains: search, mode: 'insensitive' } },
        { makeString: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [listings, total] = await Promise.all([
      this.prisma.client.boatsComListing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { lastSyncedAt: 'desc' },
      }),
      this.prisma.client.boatsComListing.count({ where }),
    ]);

    return successPaginatedResponse(
      listings,
      { page, limit, total },
      'Boats.com listings fetched successfully',
    );
  }

  @HandleError('Failed to get boats.com AI-formatted listings')
  async getAiFormat(query: AiQueryDto) {
    const { page = 1, limit = 10 } = query;

    const [listings, total] = await Promise.all([
      this.prisma.client.boatsComListing.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { lastSyncedAt: 'desc' },
      }),
      this.prisma.client.boatsComListing.count(),
    ]);

    const data = listings.map((listing) => {
      const engines = Array.isArray(listing.engines)
        ? (listing.engines as Record<string, unknown>[]).map((eng) => ({
            Make: eng.make ?? null,
            Model: eng.model ?? null,
            Fuel: eng.fuel ?? null,
            EnginePower: eng.enginePower ?? null,
            Type: eng.type ?? null,
            Year: eng.year ?? null,
            Hours: eng.hours ?? null,
            BoatEngineLocationCode: eng.boatEngineLocationCode ?? null,
            PropellerType: eng.propellerType ?? null,
          }))
        : [];

      const totalHp = engines.reduce((sum, eng) => {
        const match = String(eng.EnginePower ?? '').match(/^(\d+)/);
        return sum + (match ? parseInt(match[1], 10) : 0);
      }, 0);

      const images = Array.isArray(listing.images)
        ? (listing.images as Record<string, unknown>[])[0]
        : null;

      return {
        Source: 'inventory',
        DocumentID: listing.documentId,
        LastModificationDate: listing.lastModificationDate ?? null,
        ItemReceivedDate: listing.itemReceivedDate ?? null,
        OriginalPrice:
          listing.originalPrice != null ? `${listing.originalPrice} USD` : null,
        Price: listing.price != null ? `${listing.price.toFixed(2)} USD` : null,
        BoatLocation: {
          BoatCityName: listing.city ?? null,
          BoatCountryID: listing.country ?? null,
          BoatStateCode: listing.state ?? null,
        },
        MakeString: listing.makeString ?? null,
        ModelYear: listing.modelYear ?? null,
        Model: listing.model ?? null,
        ...(listing.listingTitle ? { ListingTitle: listing.listingTitle } : {}),
        BeamMeasure:
          listing.beamMeasure != null ? `${listing.beamMeasure} ft` : null,
        FuelTankCapacityMeasure: listing.fuelTankCapacity ?? null,
        TotalEnginePowerQuantity: totalHp > 0 ? `${totalHp} hp` : null,
        NominalLength:
          listing.nominalLength != null ? `${listing.nominalLength} ft` : null,
        LengthOverall:
          listing.lengthOverall != null ? `${listing.lengthOverall} ft` : null,
        Engines: engines,
        GeneralBoatDescription: listing.description
          ? [listing.description]
          : [],
        AdditionalDetailDescription: listing.additionalDescription
          ? [listing.additionalDescription]
          : [],
        Images: images
          ? {
              Priority: images.priority ?? '0',
              Caption: images.caption ?? null,
              Uri: images.uri ?? null,
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

  @HandleError('Failed to get boats.com listing')
  async getOne(documentId: string) {
    const listing = await this.prisma.client.boatsComListing.findUnique({
      where: { documentId },
    });

    if (!listing) {
      throw new AppError(
        HttpStatus.NOT_FOUND,
        `Boats.com listing not found: ${documentId}`,
      );
    }

    return successResponse(listing, 'Boats.com listing fetched successfully');
  }
}
