import { Module } from '@nestjs/common';
import { AboutUsModule } from './aboutus/aboutus.module';
import { AISearchBannerModule } from './aisearchbanner/aisearchbanner.module';
import { BoatsModule } from './boats/boats.module';
import { BoatsSyncAdminModule } from './boats-sync/boats-sync.module';
import { CategoryModule } from './category/category.module';
import { ContactUsModule } from './contactus/contactus.module';
import { BlogModule } from './content/blog/blog.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FeaturedBrandsModule } from './featuredbrands/featured-brands.module';
import { ListingManagementModule } from './listing-management/listing-management.module';
import { BannerModule } from './pagebanner/banner.module';
import { PrivacyPolicyModule } from './privacy-policy/privacy-policy.module';
import { SettingsModule } from './settings/settings.module';
import { TermsOfServiceModule } from './terms-of-service/terms-of-service.module';
import { UserPermissionsModule } from './users-permissions/user-permissions.module';

// NOTE: No SellerManagementModule, PackageBannerModule, or AdminSubscriptionModule
// Jupiter Marine does not have seller onboarding or seller subscription features.

@Module({
  imports: [
    BoatsModule,
    BoatsSyncAdminModule,
    TermsOfServiceModule,
    PrivacyPolicyModule,
    UserPermissionsModule,
    BannerModule,
    BlogModule,
    DashboardModule,
    ListingManagementModule,
    SettingsModule,
    FeaturedBrandsModule,
    AISearchBannerModule,
    AboutUsModule,
    ContactUsModule,
    CategoryModule,
  ],
})
export class AdminModule {}
