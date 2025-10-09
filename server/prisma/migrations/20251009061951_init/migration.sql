-- CreateEnum
CREATE TYPE "PropertyCategory" AS ENUM ('RESIDENTIAL', 'COMMERCIAL');

-- CreateEnum
CREATE TYPE "ResidentialType" AS ENUM ('APARTMENT', 'CONDO', 'TOWNHOUSE', 'MULTI_FAMILY', 'SINGLE_FAMILY', 'STUDIO');

-- CreateEnum
CREATE TYPE "CommercialType" AS ENUM ('INDUSTRIAL', 'OFFICE', 'RETAIL', 'SHOPPING_CENTER', 'STORAGE', 'PARKING_SPACE', 'WAREHOUSE');

-- CreateEnum
CREATE TYPE "RentCycle" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TENANT');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MaintenancePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "LeaseStatus" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'TENANT',
    "profileImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "landlordId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "PropertyCategory" NOT NULL,
    "residentialType" "ResidentialType",
    "commercialType" "CommercialType",
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "zipCode" TEXT,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "size" INTEGER,
    "yearBuilt" INTEGER,
    "rentAmount" DOUBLE PRECISION NOT NULL,
    "rentCycle" "RentCycle" NOT NULL,
    "securityDeposit" DOUBLE PRECISION,
    "availableDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingAmenity" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingAmenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingImage" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lease" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "landlordId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "rentAmount" DOUBLE PRECISION NOT NULL,
    "paymentFrequency" "RentCycle" NOT NULL,
    "securityDeposit" DOUBLE PRECISION,
    "paymentMethod" TEXT,
    "leaseStatus" "LeaseStatus" NOT NULL DEFAULT 'ACTIVE',
    "leaseDocument" TEXT,
    "signedContract" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceRequest" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "MaintenancePriority",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "Listing_landlordId_idx" ON "Listing"("landlordId");

-- CreateIndex
CREATE INDEX "Listing_city_category_idx" ON "Listing"("city", "category");

-- CreateIndex
CREATE INDEX "Listing_rentCycle_idx" ON "Listing"("rentCycle");

-- CreateIndex
CREATE INDEX "ListingAmenity_listingId_idx" ON "ListingAmenity"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "ListingAmenity_listingId_name_key" ON "ListingAmenity"("listingId", "name");

-- CreateIndex
CREATE INDEX "ListingImage_listingId_idx" ON "ListingImage"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "ListingImage_listingId_url_key" ON "ListingImage"("listingId", "url");

-- CreateIndex
CREATE INDEX "Lease_tenantId_idx" ON "Lease"("tenantId");

-- CreateIndex
CREATE INDEX "Lease_landlordId_idx" ON "Lease"("landlordId");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingAmenity" ADD CONSTRAINT "ListingAmenity_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingImage" ADD CONSTRAINT "ListingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
