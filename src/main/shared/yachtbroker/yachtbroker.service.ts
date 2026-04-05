import { AppError } from '@/common/error/handle-error.app';
import { HandleError } from '@/common/error/handle-error.decorator';
import { successPaginatedResponse, successResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from 'generated/client';
import { YachtBrokerFilterDto } from './yachtbroker.dto';

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

  @HandleError('Failed to get YachtBroker listing')
  async getOne(externalId: string) {
    const listing = await this.prisma.client.yachtBrokerListing.findUnique({
      where: { externalId },
    });

    if (!listing) {
      throw new AppError(HttpStatus.NOT_FOUND, `YachtBroker listing not found: ${externalId}`);
    }

    return successResponse(listing, 'YachtBroker listing fetched successfully');
  }
}
