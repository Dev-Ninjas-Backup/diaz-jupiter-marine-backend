-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('HOME', 'BLOG', 'CONTACT', 'SEARCH', 'PRIVACY_POLICY', 'TERMS_AND_CONDITION');

-- CreateEnum
CREATE TYPE "SiteType" AS ENUM ('JUPITER');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BoatSpecificationType" AS ENUM ('MAKE', 'MODEL', 'ENGINE_TYPE', 'FUEL_TYPE', 'CLASS', 'MATERIAL', 'CONDITION', 'PROP_TYPE', 'PROP_MATERIAL');

-- CreateEnum
CREATE TYPE "BoatFeatureType" AS ENUM ('ELECTRONICS', 'INSIDE_EQUIPMENT', 'OUTSIDE_EQUIPMENT', 'ELECTRICAL_EQUIPMENT', 'COVERS', 'ADDITIONAL_EQUIPMENT');

-- CreateEnum
CREATE TYPE "DataInsertSource" AS ENUM ('USER', 'SYSTEM');

-- CreateEnum
CREATE TYPE "BoatListingStatus" AS ENUM ('DRAFT', 'PENDING', 'ACTIVE', 'INACTIVE', 'SOLD');

-- CreateEnum
CREATE TYPE "BoatImageType" AS ENUM ('COVER', 'GALLERY');

-- CreateEnum
CREATE TYPE "ContactSource" AS ENUM ('JUPITER');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('INDIVIDUAL_LISTING', 'GLOBAL');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('image', 'docs', 'link', 'document', 'any', 'video', 'audio');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL', 'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHF', 'CLP', 'CNY', 'COP', 'CRC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'FOK', 'GBP', 'GEL', 'GGP', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'IMP', 'INR', 'IQD', 'IRR', 'ISK', 'JEP', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KID', 'KMF', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLE', 'SLL', 'SOS', 'SRD', 'SSP', 'STN', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TVD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'UYU', 'UZS', 'VES', 'VND', 'VUV', 'WST', 'XAF', 'XCD', 'XDR', 'XOF', 'XPF', 'YER', 'ZAR', 'ZMW', 'ZWL');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DELETED');

-- CreateEnum
CREATE TYPE "OtpType" AS ENUM ('VERIFICATION', 'RESET');

-- CreateTable
CREATE TABLE "ai_search_banners" (
    "id" TEXT NOT NULL,
    "site" "SiteType" NOT NULL DEFAULT 'JUPITER',
    "bannerTitle" TEXT NOT NULL,
    "subtitle" TEXT,
    "aiSearchBannerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_search_banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_banners" (
    "id" TEXT NOT NULL,
    "page" "PageType" NOT NULL,
    "site" "SiteType" NOT NULL DEFAULT 'JUPITER',
    "bannerTitle" TEXT NOT NULL,
    "subtitle" TEXT,
    "backgroundId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog" (
    "id" TEXT NOT NULL,
    "blogImageId" TEXT,
    "blogTitle" VARCHAR(255) NOT NULL,
    "blogDescription" TEXT NOT NULL,
    "sharedLink" VARCHAR(255) NOT NULL,
    "readTime" INTEGER DEFAULT 5,
    "postStatus" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boat_specifications" (
    "id" TEXT NOT NULL,
    "type" "BoatSpecificationType" NOT NULL,
    "name" TEXT NOT NULL,
    "meta" JSONB,
    "source" "DataInsertSource" NOT NULL DEFAULT 'USER',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boat_specifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boat_features" (
    "id" TEXT NOT NULL,
    "type" "BoatFeatureType" NOT NULL,
    "name" TEXT NOT NULL,
    "meta" JSONB,
    "source" "DataInsertSource" NOT NULL DEFAULT 'USER',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boat_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boats" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "buildYear" INTEGER NOT NULL,
    "description" TEXT,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "material" TEXT,
    "condition" TEXT NOT NULL,
    "engineType" TEXT,
    "propType" TEXT,
    "propMaterial" TEXT,
    "electronics" TEXT[],
    "insideEquipment" TEXT[],
    "outsideEquipment" TEXT[],
    "electricalEquipment" TEXT[],
    "covers" TEXT[],
    "additionalEquipment" TEXT[],
    "length" DOUBLE PRECISION NOT NULL,
    "beam" DOUBLE PRECISION,
    "draft" DOUBLE PRECISION,
    "enginesNumber" INTEGER NOT NULL,
    "cabinsNumber" INTEGER,
    "headsNumber" INTEGER,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "extraDetails" JSONB,
    "status" "BoatListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "videoURL" TEXT,

    CONSTRAINT "boats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boat_engines" (
    "id" TEXT NOT NULL,
    "hours" INTEGER,
    "horsepower" INTEGER,
    "make" TEXT,
    "model" TEXT,
    "fuelType" TEXT,
    "propellerType" TEXT,
    "boatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boat_engines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boat_images" (
    "id" TEXT NOT NULL,
    "boatId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "imageType" "BoatImageType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boat_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "imageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "source" "ContactSource" NOT NULL DEFAULT 'JUPITER',
    "type" "ContactType" NOT NULL,
    "listingId" TEXT,
    "listingSource" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Not Contacted',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_us" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "boatInformation" TEXT,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_us_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_info" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "workingHours" JSONB NOT NULL,
    "socialMedia" JSONB,
    "backgroundImageId" TEXT,
    "site" "SiteType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "boatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aboutpage" (
    "id" TEXT NOT NULL,
    "site" "SiteType" NOT NULL DEFAULT 'JUPITER',
    "aboutTitle" VARCHAR(255),
    "aboutDescription" TEXT,
    "mission" TEXT,
    "vision" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aboutpage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contactpage" (
    "id" TEXT NOT NULL,
    "site" "SiteType" NOT NULL DEFAULT 'JUPITER',
    "contactTitle" VARCHAR(255),
    "contactDescription" TEXT,
    "contactTopImageId" TEXT,
    "contactBottomImageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contactpage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "privacypolicy" (
    "id" TEXT NOT NULL,
    "site" "SiteType" NOT NULL DEFAULT 'JUPITER',
    "privacyTitle" VARCHAR(255) NOT NULL,
    "privacyDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "privacypolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terms_of_services" (
    "id" TEXT NOT NULL,
    "site" "SiteType" NOT NULL DEFAULT 'JUPITER',
    "termsTitle" VARCHAR(255) NOT NULL,
    "termsDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "terms_of_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_settings" (
    "id" TEXT NOT NULL,
    "site" "SiteType" NOT NULL DEFAULT 'JUPITER',
    "companyName" VARCHAR(255),
    "companyDescription" TEXT,
    "quickLinks" JSONB,
    "policyLinks" JSONB,
    "phone" VARCHAR(50),
    "email" VARCHAR(255),
    "socialMediaLinks" JSONB,
    "copyrightText" TEXT DEFAULT '© Copyright 2025 by Jupiter Marine Sales. All rights reserved.',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_subscriptions" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "site" "SiteType" NOT NULL DEFAULT 'JUPITER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" TEXT NOT NULL,
    "site" "SiteType" NOT NULL DEFAULT 'JUPITER',
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "questions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "why_us" (
    "id" TEXT NOT NULL,
    "site" "SiteType" NOT NULL DEFAULT 'JUPITER',
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "excellence" VARCHAR(255),
    "boatsSoldPerYear" VARCHAR(100),
    "listingViewed" VARCHAR(100),
    "buttonText" VARCHAR(100),
    "buttonLink" VARCHAR(500),
    "image1Id" TEXT,
    "image2Id" TEXT,
    "image3Id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "why_us_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "our_story" (
    "id" TEXT NOT NULL,
    "site" "SiteType" NOT NULL DEFAULT 'JUPITER',
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "image1Id" TEXT,
    "image2Id" TEXT,
    "image3Id" TEXT,
    "image4Id" TEXT,
    "image5Id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "our_story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission_vision" (
    "id" TEXT NOT NULL,
    "site" "SiteType" NOT NULL DEFAULT 'JUPITER',
    "title" VARCHAR(255) NOT NULL,
    "missionTitle" TEXT,
    "description" TEXT,
    "visionTitle" TEXT,
    "visionDescription" TEXT,
    "image1Id" TEXT,
    "image2Id" TEXT,
    "image3Id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mission_vision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "what_sets_us_apart" (
    "id" TEXT NOT NULL,
    "site" "SiteType" NOT NULL DEFAULT 'JUPITER',
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "yearsOfYachtingExcellence" VARCHAR(100),
    "boatsSoldIn2024" VARCHAR(100),
    "listingsViewedMonthly" VARCHAR(100),
    "image1Id" TEXT,
    "image2Id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "what_sets_us_apart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "featured_brands" (
    "id" TEXT NOT NULL,
    "featuredbrandId" TEXT,
    "site" "SiteType" NOT NULL DEFAULT 'JUPITER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "featured_brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_instances" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileType" "FileType" NOT NULL DEFAULT 'any',
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "meta" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "our_team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "bio" TEXT,
    "email" TEXT,
    "contact" TEXT,
    "imageId" TEXT,
    "site" "SiteType" NOT NULL DEFAULT 'JUPITER',
    "order" SERIAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "our_team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "logoId" TEXT,
    "newListingSubmitted" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitor_sessions" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "userAgent" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "page" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationSeconds" INTEGER,

    CONSTRAINT "visitor_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_views" (
    "id" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "googleId" TEXT,
    "phone" TEXT,
    "name" TEXT NOT NULL DEFAULT 'Unnamed User',
    "avatarUrl" TEXT DEFAULT 'https://www.gravatar.com/avatar/000000000000000000000000000000?d=mp&f=y',
    "country" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "isLoggedIn" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "lastLogoutAt" TIMESTAMP(3),
    "lastActiveAt" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "otp" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "otpType" "OtpType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_blogImage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_blogImage_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OurStories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OurStories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_MissionVisions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MissionVisions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_WhatSetsUsAparts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_WhatSetsUsAparts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_search_banners_site_key" ON "ai_search_banners"("site");

-- CreateIndex
CREATE UNIQUE INDEX "blog_sharedLink_key" ON "blog"("sharedLink");

-- CreateIndex
CREATE UNIQUE INDEX "boat_specifications_type_name_key" ON "boat_specifications"("type", "name");

-- CreateIndex
CREATE UNIQUE INDEX "boat_features_type_name_key" ON "boat_features"("type", "name");

-- CreateIndex
CREATE UNIQUE INDEX "boats_listingId_key" ON "boats"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_imageId_key" ON "categories"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "contact_info_backgroundImageId_key" ON "contact_info"("backgroundImageId");

-- CreateIndex
CREATE UNIQUE INDEX "contact_info_site_key" ON "contact_info"("site");

-- CreateIndex
CREATE UNIQUE INDEX "aboutpage_site_key" ON "aboutpage"("site");

-- CreateIndex
CREATE UNIQUE INDEX "contactpage_contactTopImageId_key" ON "contactpage"("contactTopImageId");

-- CreateIndex
CREATE UNIQUE INDEX "contactpage_contactBottomImageId_key" ON "contactpage"("contactBottomImageId");

-- CreateIndex
CREATE UNIQUE INDEX "contactpage_site_key" ON "contactpage"("site");

-- CreateIndex
CREATE UNIQUE INDEX "privacypolicy_site_key" ON "privacypolicy"("site");

-- CreateIndex
CREATE UNIQUE INDEX "terms_of_services_site_key" ON "terms_of_services"("site");

-- CreateIndex
CREATE UNIQUE INDEX "footer_settings_site_key" ON "footer_settings"("site");

-- CreateIndex
CREATE INDEX "email_subscriptions_email_idx" ON "email_subscriptions"("email");

-- CreateIndex
CREATE INDEX "email_subscriptions_site_idx" ON "email_subscriptions"("site");

-- CreateIndex
CREATE UNIQUE INDEX "email_subscriptions_email_site_key" ON "email_subscriptions"("email", "site");

-- CreateIndex
CREATE INDEX "faqs_site_idx" ON "faqs"("site");

-- CreateIndex
CREATE UNIQUE INDEX "why_us_image1Id_key" ON "why_us"("image1Id");

-- CreateIndex
CREATE UNIQUE INDEX "why_us_image2Id_key" ON "why_us"("image2Id");

-- CreateIndex
CREATE UNIQUE INDEX "why_us_image3Id_key" ON "why_us"("image3Id");

-- CreateIndex
CREATE INDEX "why_us_site_idx" ON "why_us"("site");

-- CreateIndex
CREATE UNIQUE INDEX "why_us_site_key" ON "why_us"("site");

-- CreateIndex
CREATE UNIQUE INDEX "our_story_image1Id_key" ON "our_story"("image1Id");

-- CreateIndex
CREATE UNIQUE INDEX "our_story_image2Id_key" ON "our_story"("image2Id");

-- CreateIndex
CREATE UNIQUE INDEX "our_story_image3Id_key" ON "our_story"("image3Id");

-- CreateIndex
CREATE UNIQUE INDEX "our_story_image4Id_key" ON "our_story"("image4Id");

-- CreateIndex
CREATE UNIQUE INDEX "our_story_image5Id_key" ON "our_story"("image5Id");

-- CreateIndex
CREATE INDEX "our_story_site_idx" ON "our_story"("site");

-- CreateIndex
CREATE UNIQUE INDEX "our_story_site_key" ON "our_story"("site");

-- CreateIndex
CREATE UNIQUE INDEX "mission_vision_image1Id_key" ON "mission_vision"("image1Id");

-- CreateIndex
CREATE UNIQUE INDEX "mission_vision_image2Id_key" ON "mission_vision"("image2Id");

-- CreateIndex
CREATE UNIQUE INDEX "mission_vision_image3Id_key" ON "mission_vision"("image3Id");

-- CreateIndex
CREATE INDEX "mission_vision_site_idx" ON "mission_vision"("site");

-- CreateIndex
CREATE UNIQUE INDEX "mission_vision_site_key" ON "mission_vision"("site");

-- CreateIndex
CREATE UNIQUE INDEX "what_sets_us_apart_image1Id_key" ON "what_sets_us_apart"("image1Id");

-- CreateIndex
CREATE UNIQUE INDEX "what_sets_us_apart_image2Id_key" ON "what_sets_us_apart"("image2Id");

-- CreateIndex
CREATE INDEX "what_sets_us_apart_site_idx" ON "what_sets_us_apart"("site");

-- CreateIndex
CREATE UNIQUE INDEX "what_sets_us_apart_site_key" ON "what_sets_us_apart"("site");

-- CreateIndex
CREATE UNIQUE INDEX "user_notifications_userId_notificationId_key" ON "user_notifications"("userId", "notificationId");

-- CreateIndex
CREATE INDEX "our_team_site_idx" ON "our_team"("site");

-- CreateIndex
CREATE INDEX "visitor_sessions_ip_idx" ON "visitor_sessions"("ip");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE INDEX "_blogImage_B_index" ON "_blogImage"("B");

-- CreateIndex
CREATE INDEX "_OurStories_B_index" ON "_OurStories"("B");

-- CreateIndex
CREATE INDEX "_MissionVisions_B_index" ON "_MissionVisions"("B");

-- CreateIndex
CREATE INDEX "_WhatSetsUsAparts_B_index" ON "_WhatSetsUsAparts"("B");

-- AddForeignKey
ALTER TABLE "ai_search_banners" ADD CONSTRAINT "ai_search_banners_aiSearchBannerId_fkey" FOREIGN KEY ("aiSearchBannerId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_banners" ADD CONSTRAINT "page_banners_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog" ADD CONSTRAINT "blog_blogImageId_fkey" FOREIGN KEY ("blogImageId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boats" ADD CONSTRAINT "boats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boat_engines" ADD CONSTRAINT "boat_engines_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "boats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boat_images" ADD CONSTRAINT "boat_images_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "boats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boat_images" ADD CONSTRAINT "boat_images_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_info" ADD CONSTRAINT "contact_info_backgroundImageId_fkey" FOREIGN KEY ("backgroundImageId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "boats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contactpage" ADD CONSTRAINT "contactpage_contactTopImageId_fkey" FOREIGN KEY ("contactTopImageId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contactpage" ADD CONSTRAINT "contactpage_contactBottomImageId_fkey" FOREIGN KEY ("contactBottomImageId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "why_us" ADD CONSTRAINT "why_us_image1Id_fkey" FOREIGN KEY ("image1Id") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "why_us" ADD CONSTRAINT "why_us_image2Id_fkey" FOREIGN KEY ("image2Id") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "why_us" ADD CONSTRAINT "why_us_image3Id_fkey" FOREIGN KEY ("image3Id") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "our_story" ADD CONSTRAINT "our_story_image1Id_fkey" FOREIGN KEY ("image1Id") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "our_story" ADD CONSTRAINT "our_story_image2Id_fkey" FOREIGN KEY ("image2Id") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "our_story" ADD CONSTRAINT "our_story_image3Id_fkey" FOREIGN KEY ("image3Id") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "our_story" ADD CONSTRAINT "our_story_image4Id_fkey" FOREIGN KEY ("image4Id") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "our_story" ADD CONSTRAINT "our_story_image5Id_fkey" FOREIGN KEY ("image5Id") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_vision" ADD CONSTRAINT "mission_vision_image1Id_fkey" FOREIGN KEY ("image1Id") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_vision" ADD CONSTRAINT "mission_vision_image2Id_fkey" FOREIGN KEY ("image2Id") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_vision" ADD CONSTRAINT "mission_vision_image3Id_fkey" FOREIGN KEY ("image3Id") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "what_sets_us_apart" ADD CONSTRAINT "what_sets_us_apart_image1Id_fkey" FOREIGN KEY ("image1Id") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "what_sets_us_apart" ADD CONSTRAINT "what_sets_us_apart_image2Id_fkey" FOREIGN KEY ("image2Id") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "featured_brands" ADD CONSTRAINT "featured_brands_featuredbrandId_fkey" FOREIGN KEY ("featuredbrandId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "our_team" ADD CONSTRAINT "our_team_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blogImage" ADD CONSTRAINT "_blogImage_A_fkey" FOREIGN KEY ("A") REFERENCES "blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blogImage" ADD CONSTRAINT "_blogImage_B_fkey" FOREIGN KEY ("B") REFERENCES "file_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OurStories" ADD CONSTRAINT "_OurStories_A_fkey" FOREIGN KEY ("A") REFERENCES "file_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OurStories" ADD CONSTRAINT "_OurStories_B_fkey" FOREIGN KEY ("B") REFERENCES "our_story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MissionVisions" ADD CONSTRAINT "_MissionVisions_A_fkey" FOREIGN KEY ("A") REFERENCES "file_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MissionVisions" ADD CONSTRAINT "_MissionVisions_B_fkey" FOREIGN KEY ("B") REFERENCES "mission_vision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WhatSetsUsAparts" ADD CONSTRAINT "_WhatSetsUsAparts_A_fkey" FOREIGN KEY ("A") REFERENCES "file_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WhatSetsUsAparts" ADD CONSTRAINT "_WhatSetsUsAparts_B_fkey" FOREIGN KEY ("B") REFERENCES "what_sets_us_apart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
