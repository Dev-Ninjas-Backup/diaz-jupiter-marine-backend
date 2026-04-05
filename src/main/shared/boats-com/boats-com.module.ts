import { Module } from '@nestjs/common';
import { BoatsComController } from './boats-com.controller';
import { BoatsComService } from './boats-com.service';

@Module({
  controllers: [BoatsComController],
  providers: [BoatsComService],
})
export class BoatsComModule {}
