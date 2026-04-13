import { Module } from '@nestjs/common';
import { BoatLookupController } from './boat-lookup.controller';
import { BoatLookupService } from './boat-lookup.service';

@Module({
  controllers: [BoatLookupController],
  providers: [BoatLookupService],
})
export class BoatLookupModule {}
