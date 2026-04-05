import { HandleError } from '@/common/error/handle-error.decorator';
import { ValidateAdmin } from '@/common/jwt/jwt.decorator';
import { successResponse } from '@/common/utils/response.util';
import { BoatsComSyncService } from '@/lib/boats-sync/services/boats-com-sync.service';
import { YachtBrokerSyncService } from '@/lib/boats-sync/services/yachtbroker-sync.service';
import { PrismaService } from '@/lib/prisma/prisma.service';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Admin -- Boats Sync')
@ApiBearerAuth()
@ValidateAdmin()
@Controller('admin/boats-sync')
export class BoatsSyncAdminController {
  constructor(
    private readonly boatsComSyncService: BoatsComSyncService,
    private readonly yachtBrokerSyncService: YachtBrokerSyncService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('boats-com')
  @ApiOperation({ summary: 'Manually trigger boats.com sync' })
  @HandleError('Failed to sync boats.com')
  async syncBoatsCom() {
    const result = await this.boatsComSyncService.syncAll();
    return successResponse(result, 'Boats.com sync completed successfully');
  }

  @Post('yachtbroker')
  @ApiOperation({
    summary: 'Manually trigger YachtBroker sync',
    description:
      'Runs a **full** paginated sync (every page). Scheduled jobs use incremental sync (first and last page only).',
  })
  @HandleError('Failed to sync YachtBroker')
  async syncYachtBroker() {
    const result = await this.yachtBrokerSyncService.syncAll({ mode: 'full' });
    return successResponse(result, 'YachtBroker sync completed successfully');
  }

  @Post('boats-com/import')
  @ApiOperation({
    summary: 'Import boats.com listings pushed from the frontend browser',
    description:
      'Frontend fetches boats.com API directly (bypasses Cloudflare) and POSTs the raw `results` array here for storage.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['results'],
      properties: {
        results: {
          type: 'array',
          items: { type: 'object' },
          description: 'Raw results array from boats.com API response',
        },
      },
    },
  })
  @HandleError('Failed to import boats.com listings')
  async importBoatsComFromFrontend(
    @Body() body: { results: Record<string, unknown>[] },
  ) {
    if (!Array.isArray(body?.results)) {
      throw new BadRequestException('body.results must be an array');
    }
    const result = await this.boatsComSyncService.importFromFrontend(
      body.results,
    );
    return successResponse(result, 'Boats.com import completed successfully');
  }

  @Post('all')
  @ApiOperation({
    summary: 'Manually trigger sync for all boat sources concurrently',
    description:
      'YachtBroker is synced in **full** mode (all pages), same as POST /yachtbroker.',
  })
  @HandleError('Failed to sync all boat sources')
  async syncAll() {
    const [boatsComResult, yachtBrokerResult] = await Promise.all([
      this.boatsComSyncService.syncAll(),
      this.yachtBrokerSyncService.syncAll({ mode: 'full' }),
    ]);
    return successResponse(
      { boatsCom: boatsComResult, yachtBroker: yachtBrokerResult },
      'All boats sync completed successfully',
    );
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get sync status: record counts and last sync time',
  })
  @HandleError('Failed to fetch sync status')
  async getSyncStatus() {
    const [boatsComCount, yachtBrokerCount, latestBoatsCom, latestYachtBroker] =
      await Promise.all([
        this.prisma.client.boatsComListing.count(),
        this.prisma.client.yachtBrokerListing.count(),
        this.prisma.client.boatsComListing.findFirst({
          orderBy: { lastSyncedAt: 'desc' },
          select: { lastSyncedAt: true },
        }),
        this.prisma.client.yachtBrokerListing.findFirst({
          orderBy: { lastSyncedAt: 'desc' },
          select: { lastSyncedAt: true },
        }),
      ]);

    return successResponse(
      {
        boatsCom: {
          count: boatsComCount,
          lastSyncedAt: latestBoatsCom?.lastSyncedAt ?? null,
        },
        yachtBroker: {
          count: yachtBrokerCount,
          lastSyncedAt: latestYachtBroker?.lastSyncedAt ?? null,
        },
      },
      'Sync status fetched successfully',
    );
  }
}
