import { HandleError } from '@/common/error/handle-error.decorator';
import { AppError } from '@/common/error/handle-error.app';
import {
  successPaginatedResponse,
  successResponse,
} from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from 'generated/client';
import { BoatsComFilterDto } from './boats-com.dto';

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
