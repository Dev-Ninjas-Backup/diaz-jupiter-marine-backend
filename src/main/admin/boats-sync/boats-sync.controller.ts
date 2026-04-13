import { PermissionEnum } from '@/common/enum/permission.enum';
import { HandleError } from '@/common/error/handle-error.decorator';
import { RequirePermission } from '@/common/jwt/jwt.decorator';
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
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Admin -- Boats Sync')
@Controller('admin/boats-sync')
export class BoatsSyncAdminController {
  constructor(
    private readonly boatsComSyncService: BoatsComSyncService,
    private readonly yachtBrokerSyncService: YachtBrokerSyncService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('boats-com')
  @RequirePermission(PermissionEnum.BOATS_SYNC)
  @ApiOperation({ summary: 'Manually trigger boats.com sync' })
  @HandleError('Failed to sync boats.com')
  async syncBoatsCom() {
    const result = await this.boatsComSyncService.syncAll();
    return successResponse(result, 'Boats.com sync completed successfully');
  }

  @Post('yachtbroker')
  @RequirePermission(PermissionEnum.BOATS_SYNC)
  @ApiOperation({
    summary: 'Manually trigger YachtBroker sync',
    description:
      'Runs a **full** paginated sync (every page). Scheduled jobs use incremental sync.',
  })
  @HandleError('Failed to sync YachtBroker')
  async syncYachtBroker() {
    const result = await this.yachtBrokerSyncService.syncAll({ mode: 'full' });
    return successResponse(result, 'YachtBroker sync completed successfully');
  }

  @Post('boats-com/import')
  @RequirePermission(PermissionEnum.BOATS_SYNC)
  @ApiOperation({
    summary: 'Import boats.com listings pushed from the frontend browser',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['results'],
      properties: {
        results: { type: 'array', items: { type: 'object' } },
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

  @Post('yachtbroker/import')
  @RequirePermission(PermissionEnum.BOATS_SYNC)
  @ApiOperation({
    summary:
      'Import YachtBroker vessel listings pushed from the frontend browser',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['vessels'],
      properties: {
        vessels: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  @HandleError('Failed to import YachtBroker listings')
  async importYachtBrokerFromFrontend(
    @Body() body: { vessels: Record<string, unknown>[] },
  ) {
    if (!Array.isArray(body?.vessels)) {
      throw new BadRequestException('body.vessels must be an array');
    }
    const result = await this.yachtBrokerSyncService.importFromFrontend(
      body.vessels,
    );
    return successResponse(result, 'YachtBroker import completed successfully');
  }

  @Post('all')
  @RequirePermission(PermissionEnum.BOATS_SYNC)
  @ApiOperation({
    summary: 'Manually trigger sync for all boat sources concurrently',
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
  @RequirePermission(PermissionEnum.BOATS_SYNC)
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
