import { Global, Module } from '@nestjs/common';
import { BoatsFeatureService } from './services/boats-feature.service';
import { BoatsSpecificationService } from './services/boats-specification.service';
import { FileService } from './services/file.service';
import { SuperAdminService } from './services/super-admin.service';

// NOTE: No SubscriptionPlanService — Jupiter Marine has no seller subscription plans.

@Global()
@Module({
  imports: [],
  providers: [
    SuperAdminService,
    FileService,
    BoatsSpecificationService,
    BoatsFeatureService,
  ],
})
export class SeedModule {}
