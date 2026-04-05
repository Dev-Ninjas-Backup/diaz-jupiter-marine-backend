import { Module } from '@nestjs/common';
import { YachtBrokerController } from './yachtbroker.controller';
import { YachtBrokerService } from './yachtbroker.service';

@Module({
  controllers: [YachtBrokerController],
  providers: [YachtBrokerService],
})
export class YachtBrokerModule {}
