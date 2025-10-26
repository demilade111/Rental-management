/*
  Warnings:

  - You are about to drop the column `tenantId` on the `MaintenanceRequest` table. All the data in the column will be lost.
  - Added the required column `userId` to the `MaintenanceRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."MaintenanceRequest" DROP CONSTRAINT "MaintenanceRequest_tenantId_fkey";

-- DropIndex
DROP INDEX "public"."MaintenanceRequest_tenantId_createdAt_idx";

-- AlterTable
ALTER TABLE "MaintenanceRequest" DROP COLUMN "tenantId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "MaintenanceRequest_userId_createdAt_idx" ON "MaintenanceRequest"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
