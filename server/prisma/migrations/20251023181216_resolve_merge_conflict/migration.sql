/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Lease` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Lease` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APARTMENT', 'CONDO', 'TOWNHOUSE', 'MULTI_FAMILY', 'SINGLE_FAMILY', 'STUDIO', 'INDUSTRIAL', 'OFFICE', 'RETAIL', 'SHOPPING_CENTER', 'STORAGE', 'PARKING_SPACE', 'WAREHOUSE');

-- CreateEnum
CREATE TYPE "LeaseTermType" AS ENUM ('LONG_TERM', 'MONTH_TO_MONTH', 'YEAR_TO_YEAR');

-- CreateEnum
CREATE TYPE "NoticeType" AS ENUM ('LEGAL_MINIMUM', 'MORE_THAN_MINIMUM');

-- CreateEnum
CREATE TYPE "DepositNoticeType" AS ENUM ('LEGAL_MAXIMUM', 'LESS_THAN_MINIMUM');

-- CreateEnum
CREATE TYPE "LandlordType" AS ENUM ('INDIVIDUAL', 'CORPORATION');

-- AlterTable
ALTER TABLE "Lease" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "acceptsCash" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "acceptsCheque" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "acceptsDirectDebit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "acceptsETransfer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "acceptsOther" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "additionalLandlords" JSONB,
ADD COLUMN     "additionalTenants" JSONB,
ADD COLUMN     "allowsOccupants" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "commercialType" "CommercialType",
ADD COLUMN     "customDepositNoticeDays" INTEGER,
ADD COLUMN     "customPaymentInfo" TEXT,
ADD COLUMN     "customRentIncreaseNoticeDays" INTEGER,
ADD COLUMN     "depositAccountInfo" TEXT,
ADD COLUMN     "depositAmount" DOUBLE PRECISION,
ADD COLUMN     "depositBankName" TEXT,
ADD COLUMN     "depositReturnNoticeType" "DepositNoticeType",
ADD COLUMN     "discloseBankInfo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasSecurityDeposit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "landlordAddress" TEXT,
ADD COLUMN     "landlordEmail" TEXT,
ADD COLUMN     "landlordFullName" TEXT,
ADD COLUMN     "landlordPhone" TEXT,
ADD COLUMN     "landlordType" "LandlordType",
ADD COLUMN     "leaseTermType" "LeaseTermType",
ADD COLUMN     "numberOfOccupants" INTEGER,
ADD COLUMN     "occupants" JSONB,
ADD COLUMN     "paymentDay" INTEGER,
ADD COLUMN     "propertyAddress" TEXT,
ADD COLUMN     "propertyCategory" "PropertyCategory",
ADD COLUMN     "propertyCity" TEXT,
ADD COLUMN     "propertyCountry" TEXT,
ADD COLUMN     "propertyState" TEXT,
ADD COLUMN     "propertyZipCode" TEXT,
ADD COLUMN     "rentIncreaseNoticeType" "NoticeType",
ADD COLUMN     "residentialType" "ResidentialType",
ADD COLUMN     "tenantEmail" TEXT,
ADD COLUMN     "tenantFullName" TEXT,
ADD COLUMN     "tenantPhone" TEXT,
ALTER COLUMN "leaseStatus" SET DEFAULT 'DRAFT';
