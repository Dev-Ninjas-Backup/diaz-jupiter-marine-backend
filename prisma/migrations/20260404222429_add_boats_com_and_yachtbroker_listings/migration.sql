-- CreateTable
CREATE TABLE "boats_com_listings" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "listingTitle" TEXT,
    "makeString" TEXT,
    "model" TEXT,
    "modelYear" INTEGER,
    "price" DOUBLE PRECISION,
    "originalPrice" DOUBLE PRECISION,
    "saleClassCode" TEXT,
    "boatCategoryCode" TEXT,
    "boatHullMaterialCode" TEXT,
    "nominalLength" DOUBLE PRECISION,
    "lengthOverall" DOUBLE PRECISION,
    "beamMeasure" DOUBLE PRECISION,
    "numberOfEngines" INTEGER,
    "headsCountNumeric" INTEGER,
    "boatName" TEXT,
    "description" TEXT,
    "additionalDescription" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "stockNumber" TEXT,
    "boatHullId" TEXT,
    "fuelTankCapacity" TEXT,
    "dryWeightMeasure" TEXT,
    "bridgeClearance" TEXT,
    "maxPassengers" INTEGER,
    "lastModificationDate" TEXT,
    "itemReceivedDate" TEXT,
    "salesStatus" TEXT,
    "images" JSONB,
    "videos" JSONB,
    "engines" JSONB,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boats_com_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yachtbroker_listings" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "manufacturer" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "vesselName" TEXT,
    "priceUsd" DOUBLE PRECISION,
    "priceHidden" BOOLEAN NOT NULL DEFAULT false,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "displayLengthFeet" DOUBLE PRECISION,
    "beamFeet" DOUBLE PRECISION,
    "beamInch" DOUBLE PRECISION,
    "fuelType" TEXT,
    "hullMaterial" TEXT,
    "category" TEXT,
    "condition" TEXT,
    "status" TEXT,
    "description" TEXT,
    "summary" TEXT,
    "notableUpgrades" TEXT,
    "maxDraftFeet" DOUBLE PRECISION,
    "cabinCount" INTEGER,
    "headCount" INTEGER,
    "engineQty" INTEGER,
    "displayPicture" JSONB,
    "gallery" JSONB,
    "engines" JSONB,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "yachtbroker_listings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "boats_com_listings_documentId_key" ON "boats_com_listings"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "yachtbroker_listings_externalId_key" ON "yachtbroker_listings"("externalId");
