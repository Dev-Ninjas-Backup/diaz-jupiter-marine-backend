import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { SharedModule } from './shared/shared.module';

// NOTE: No SellerModule — Jupiter Marine does not have seller onboarding.
// All listings are managed directly by admins.

@Module({
  imports: [SharedModule, AdminModule],
  controllers: [],
  providers: [],
})
export class MainModule {}
