import { HandleError } from '@/common/error/handle-error.decorator';
import { successPaginatedResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/client';
import { SearchBoatsDto } from '../dto/search-boats.dto';

@Injectable()
export class SearchBoatsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── normalizers ────────────────────────────────────────────────────────────

  private normalizeBoatsCom(listing: any) {
    const firstImage = Array.isArray(listing.images)
      ? ((listing.images as any[])[0]?.uri ?? null)
      : null;

    return {
      source: 'boats-com' as const,
      id: listing.documentId,
      title: listing.listingTitle ?? null,
      make: listing.makeString ?? null,
      model: listing.model ?? null,
      year: listing.modelYear ?? null,
      price: listing.price ?? null,
      lengthFt: listing.nominalLength ?? listing.lengthOverall ?? null,
      boatType: listing.boatCategoryCode ?? null,
      city: listing.city ?? null,
      state: listing.state ?? null,
      country: listing.country ?? null,
      image: firstImage,
    };
  }

  private normalizeYachtBroker(listing: any) {
    const dp = listing.displayPicture as Record<string, string> | null;
    const image = dp?.large ?? dp?.hd ?? dp?.medium ?? null;

    return {
      source: 'yachtbroker' as const,
      id: listing.externalId,
      title: listing.vesselName ?? null,
      make: listing.manufacturer ?? null,
      model: listing.model ?? null,
      year: listing.year ?? null,
      price: listing.priceUsd ?? null,
      lengthFt: listing.displayLengthFeet ?? null,
      boatType: listing.category ?? null,
      city: listing.city ?? null,
      state: listing.state ?? null,
      country: listing.country ?? null,
      image,
    };
  }

  // ─── main search ─────────────────────────────────────────────────────────────

  @HandleError('Failed to search boats')
  async search(query: SearchBoatsDto) {
    const {
      page = 1,
      limit = 10,
      make,
      model,
      year,
      lengthMin,
      lengthMax,
      maxPrice,
      boatType,
      location,
    } = query;

    const globalOffset = (page - 1) * limit;

    // ── Boats.com where clause ─────────────────────────────────────────────
    const boatsComWhere: Prisma.BoatsComListingWhereInput = {};

    if (make)
      boatsComWhere.makeString = { contains: make, mode: 'insensitive' };
    if (model) boatsComWhere.model = { contains: model, mode: 'insensitive' };
    if (year) boatsComWhere.modelYear = year;
    if (boatType)
      boatsComWhere.boatCategoryCode = {
        contains: boatType,
        mode: 'insensitive',
      };
    if (lengthMin !== undefined || lengthMax !== undefined) {
      boatsComWhere.nominalLength = {
        ...(lengthMin !== undefined ? { gte: lengthMin } : {}),
        ...(lengthMax !== undefined ? { lte: lengthMax } : {}),
      };
    }
    if (maxPrice !== undefined) boatsComWhere.price = { lte: maxPrice };
    if (location) {
      boatsComWhere.OR = [
        { city: { contains: location, mode: 'insensitive' } },
        { state: { contains: location, mode: 'insensitive' } },
      ];
    }

    // ── YachtBroker where clause ───────────────────────────────────────────
    const yachtBrokerWhere: Prisma.YachtBrokerListingWhereInput = {};

    if (make)
      yachtBrokerWhere.manufacturer = { contains: make, mode: 'insensitive' };
    if (model)
      yachtBrokerWhere.model = { contains: model, mode: 'insensitive' };
    if (year) yachtBrokerWhere.year = year;
    if (boatType)
      yachtBrokerWhere.category = { contains: boatType, mode: 'insensitive' };
    if (lengthMin !== undefined || lengthMax !== undefined) {
      yachtBrokerWhere.displayLengthFeet = {
        ...(lengthMin !== undefined ? { gte: lengthMin } : {}),
        ...(lengthMax !== undefined ? { lte: lengthMax } : {}),
      };
    }
    if (maxPrice !== undefined) yachtBrokerWhere.priceUsd = { lte: maxPrice };
    if (location) {
      yachtBrokerWhere.OR = [
        { city: { contains: location, mode: 'insensitive' } },
        { state: { contains: location, mode: 'insensitive' } },
      ];
    }

    // ── Step 1: count both sources in parallel ─────────────────────────────
    const [totalBoatsCom, totalYachtBroker] = await Promise.all([
      this.prisma.client.boatsComListing.count({ where: boatsComWhere }),
      this.prisma.client.yachtBrokerListing.count({ where: yachtBrokerWhere }),
    ]);

    const totalCombined = totalBoatsCom + totalYachtBroker;

    // ── Step 2: sequential pagination split across both sources ───────────
    // Source A (boats-com) occupies indices [0 .. totalBoatsCom-1],
    // Source B (yachtbroker) occupies indices [totalBoatsCom .. totalCombined-1]
    const boatsComSkip = Math.min(globalOffset, totalBoatsCom);
    const boatsComTake = Math.min(
      limit,
      Math.max(0, totalBoatsCom - boatsComSkip),
    );

    const yachtBrokerSkip = Math.max(0, globalOffset - totalBoatsCom);
    const yachtBrokerTake = limit - boatsComTake;

    // ── Step 3: fetch from both sources in parallel ────────────────────────
    const [boatsComRows, yachtBrokerRows] = await Promise.all([
      boatsComTake > 0
        ? this.prisma.client.boatsComListing.findMany({
            where: boatsComWhere,
            skip: boatsComSkip,
            take: boatsComTake,
            orderBy: { lastSyncedAt: 'desc' },
          })
        : [],
      yachtBrokerTake > 0
        ? this.prisma.client.yachtBrokerListing.findMany({
            where: yachtBrokerWhere,
            skip: yachtBrokerSkip,
            take: yachtBrokerTake,
            orderBy: { lastSyncedAt: 'desc' },
          })
        : [],
    ]);

    // ── Step 4: normalize and merge ────────────────────────────────────────
    const data = [
      ...boatsComRows.map((r) => this.normalizeBoatsCom(r)),
      ...yachtBrokerRows.map((r) => this.normalizeYachtBroker(r)),
    ];

    return successPaginatedResponse(
      data,
      { page, limit, total: totalCombined },
      'Boats search results fetched successfully',
    );
  }
}
