-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "site" "SiteType" NOT NULL DEFAULT 'JUPITER',
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "link" TEXT,
    "logoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partners_logoId_key" ON "partners"("logoId");

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
