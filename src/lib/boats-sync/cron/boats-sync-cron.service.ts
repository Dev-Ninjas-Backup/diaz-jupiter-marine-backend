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

  /** Boats.com: daily at 02:00 */
  @Cron('0 2 * * *')
  async handleBoatsComSyncCron() {
    this.logger.log('[BoatsSyncCron] Starting scheduled Boats.com sync...');
    try {
      const result = await this.boatsComSyncService.syncAll();
      this.logger.log(
        `[BoatsSyncCron] Boats.com sync complete — added: ${result.added}, updated: ${result.updated}, total: ${result.total}`,
      );
    } catch (error) {
      this.logger.error('[BoatsSyncCron] Boats.com sync failed', error);
    }
  }

  /** YachtBroker: weekly on Sunday at 03:00 */
  @Cron('0 3 * * 0')
  async handleYachtBrokerSyncCron() {
    this.logger.log('[BoatsSyncCron] Starting scheduled YachtBroker sync...');
    try {
      const result = await this.yachtBrokerSyncService.syncAll({
        mode: 'full',
      });
      this.logger.log(
        `[BoatsSyncCron] YachtBroker sync complete — added: ${result.added}, updated: ${result.updated}, total: ${result.total}`,
      );
    } catch (error) {
      this.logger.error('[BoatsSyncCron] YachtBroker sync failed', error);
    }
  }
}
