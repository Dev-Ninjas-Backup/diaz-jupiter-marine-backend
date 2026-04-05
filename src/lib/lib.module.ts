import { Module } from '@nestjs/common';
import { BoatsGroupModule } from './boatsgroup/boats-group.module';
import { BoatsSyncModule } from './boats-sync/boats-sync.module';
import { FileModule } from './file/file.module';
import { GoogleapisModule } from './googleapis/googleapis.module';
import { MailModule } from './mail/mail.module';
import { MulterModule } from './multer/multer.module';
import { PrismaModule } from './prisma/prisma.module';
import { S3BucketModule } from './s3/s3.module';
import { SeedModule } from './seed/seed.module';
import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [
    SeedModule,
    PrismaModule,
    MailModule,
    UtilsModule,
    FileModule,
    MulterModule,
    S3BucketModule,
    BoatsGroupModule,
    GoogleapisModule,
    BoatsSyncModule,
  ],
  exports: [BoatsSyncModule],
  providers: [],
})
export class LibModule {}
