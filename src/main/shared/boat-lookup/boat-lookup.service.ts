import { AppError } from '@/common/error/handle-error.app';
import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class BoatLookupService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Given an ID returned by the AI server, resolve it to a boat detail.
   * Search order: boats-com (documentId) → yachtbroker (externalId).
   * Returns the raw listing record plus a `source` field indicating origin.
   */
  @HandleError('Failed to lookup boat by ID')
  async lookupById(id: string) {
    // 1. Try boats-com first
    const boatsCom = await this.prisma.client.boatsComListing.findUnique({
      where: { documentId: id },
    });

    if (boatsCom) {
      return successResponse(
        {
          source: 'boats-com',
          sourceUrl: `/boats-com/${boatsCom.documentId}`,
          ...boatsCom,
        },
        'Boat found in Boats.com',
      );
    }

    // 2. Try yachtbroker
    const yachtBroker = await this.prisma.client.yachtBrokerListing.findUnique({
      where: { externalId: id },
    });

    if (yachtBroker) {
      return successResponse(
        {
          source: 'yachtbroker',
          sourceUrl: `/yachtbroker/${yachtBroker.externalId}`,
          ...yachtBroker,
        },
        'Boat found in YachtBroker',
      );
    }

    throw new AppError(
      HttpStatus.NOT_FOUND,
      `No boat found with ID: ${id} in Boats.com or YachtBroker`,
    );
  }
}
