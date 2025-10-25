/*
  Warnings:

  - You are about to drop the column `address` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `commercialType` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `residentialType` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Listing` table. All the data in the column will be lost.
  - Added the required column `propertyType` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `streetAddress` to the `Listing` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Listing" DROP CONSTRAINT "Listing_landlordId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ListingAmenity" DROP CONSTRAINT "ListingAmenity_listingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ListingImage" DROP CONSTRAINT "ListingImage_listingId_fkey";

-- DropIndex
DROP INDEX "public"."Listing_city_category_idx";

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "address",
DROP COLUMN "category",
DROP COLUMN "commercialType",
DROP COLUMN "residentialType",
DROP COLUMN "size",
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "petDeposit" DOUBLE PRECISION,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "propertyOwner" TEXT,
ADD COLUMN     "propertyType" "PropertyType" NOT NULL,
ADD COLUMN     "streetAddress" TEXT NOT NULL,
ADD COLUMN     "totalSquareFeet" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Listing_city_propertyType_idx" ON "Listing"("city", "propertyType");

-- CreateIndex
CREATE INDEX "Listing_availableDate_idx" ON "Listing"("availableDate");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingAmenity" ADD CONSTRAINT "ListingAmenity_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingImage" ADD CONSTRAINT "ListingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
