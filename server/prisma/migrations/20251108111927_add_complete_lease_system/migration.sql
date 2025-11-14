/*
  Warnings:

  - Added the required column `updatedAt` to the `Lease` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('RENT', 'DEPOSIT', 'REFUND', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'APPLICATION_STATUS';
ALTER TYPE "NotificationType" ADD VALUE 'LEASE_EXPIRING';
ALTER TYPE "NotificationType" ADD VALUE 'PAYMENT_DUE';
ALTER TYPE "NotificationType" ADD VALUE 'PAYMENT_RECEIVED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RentCycle" ADD VALUE 'DAILY';
ALTER TYPE "RentCycle" ADD VALUE 'WEEKLY';

-- DropForeignKey
ALTER TABLE "public"."Lease" DROP CONSTRAINT "Lease_tenantId_fkey";

-- AlterTable
ALTER TABLE "CustomLease" ADD COLUMN     "accountingNotes" TEXT,
ADD COLUMN     "depositAmount" DOUBLE PRECISION,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "paymentDay" INTEGER,
ADD COLUMN     "paymentFrequency" "RentCycle",
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "rentAmount" DOUBLE PRECISION,
ADD COLUMN     "securityDeposit" DOUBLE PRECISION,
ADD COLUMN     "startDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Lease" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fixedEndCondition" TEXT,
ADD COLUMN     "includedServices" JSONB,
ADD COLUMN     "parkingSpaces" INTEGER,
ADD COLUMN     "periodicBasis" TEXT,
ADD COLUMN     "periodicOther" TEXT,
ADD COLUMN     "petDeposit" DOUBLE PRECISION,
ADD COLUMN     "petDepositDueDate" TIMESTAMP(3),
ADD COLUMN     "securityDepositDueDate" TIMESTAMP(3),
ADD COLUMN     "terminatedBy" TEXT,
ADD COLUMN     "terminationDate" TIMESTAMP(3),
ADD COLUMN     "terminationNotes" TEXT,
ADD COLUMN     "terminationReason" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "vacateReason" TEXT,
ALTER COLUMN "tenantId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "leaseId" TEXT,
    "customLeaseId" TEXT,
    "landlordId" TEXT NOT NULL,
    "tenantId" TEXT,
    "type" "PaymentType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3),
    "paidDate" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Payment_leaseId_idx" ON "Payment"("leaseId");

-- CreateIndex
CREATE INDEX "Payment_customLeaseId_idx" ON "Payment"("customLeaseId");

-- CreateIndex
CREATE INDEX "Payment_landlordId_idx" ON "Payment"("landlordId");

-- CreateIndex
CREATE INDEX "Payment_tenantId_idx" ON "Payment"("tenantId");

-- CreateIndex
CREATE INDEX "Payment_dueDate_idx" ON "Payment"("dueDate");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_customLeaseId_fkey" FOREIGN KEY ("customLeaseId") REFERENCES "CustomLease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
