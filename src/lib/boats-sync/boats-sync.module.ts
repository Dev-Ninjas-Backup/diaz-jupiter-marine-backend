import { Module } from '@nestjs/common';
import { BoatsSyncCronService } from './cron/boats-sync-cron.service';
import { BoatsComSyncService } from './services/boats-com-sync.service';
import { YachtBrokerSyncService } from './services/yachtbroker-sync.service';

@Module({
  providers: [
    BoatsComSyncService,
    YachtBrokerSyncService,
    BoatsSyncCronService,
  ],
  exports: [BoatsComSyncService, YachtBrokerSyncService],
})
export class BoatsSyncModule {}
