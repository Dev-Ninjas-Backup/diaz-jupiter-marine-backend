import { BoatsSyncModule } from '@/lib/boats-sync/boats-sync.module';
import { Module } from '@nestjs/common';
import { BoatsSyncAdminController } from './boats-sync.controller';

@Module({
  imports: [BoatsSyncModule],
  controllers: [BoatsSyncAdminController],
})
export class BoatsSyncAdminModule {}
