import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BoatsComSyncService } from '../services/boats-com-sync.service';
import { YachtBrokerSyncService } from '../services/yachtbroker-sync.service';

@Injectable()
export class BoatsSyncCronService {
  private readonly logger = new Logger(BoatsSyncCronService.name);

  constructor(
    private readonly boatsComSyncService: BoatsComSyncService,
    private readonly yachtBrokerSyncService: YachtBrokerSyncService,
  ) {}

  @Cron('0 */6 * * *')
  async handleBoatsSyncCron() {
    this.logger.log(
      '[BoatsSyncCron] Starting scheduled sync for all sources...',
    );

    try {
      const [boatsComResult, yachtBrokerResult] = await Promise.all([
        this.boatsComSyncService.syncAll(),
        this.yachtBrokerSyncService.syncAll({ mode: 'incremental' }),
      ]);

      this.logger.log(
        `[BoatsSyncCron] Boats.com sync complete — added: ${boatsComResult.added}, updated: ${boatsComResult.updated}, total: ${boatsComResult.total}`,
      );
      this.logger.log(
        `[BoatsSyncCron] YachtBroker sync complete — added: ${yachtBrokerResult.added}, updated: ${yachtBrokerResult.updated}, total: ${yachtBrokerResult.total}`,
      );
    } catch (error) {
      this.logger.error('[BoatsSyncCron] Scheduled sync failed', error);
    }
  }
}
