import { PrismaModule } from '@/lib/prisma/prisma.module';
import { S3BucketModule } from '@/lib/s3/s3.module';
import { Module } from '@nestjs/common';
import { PartnersController } from './partners.controller';
import { PartnersService } from './services/partners.service';

@Module({
  imports: [PrismaModule, S3BucketModule],
  controllers: [PartnersController],
  providers: [PartnersService],
  exports: [PartnersService],
})
export class PartnersModule {}
