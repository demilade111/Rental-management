-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "RequestApplication" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "tenantId" TEXT,
    "landlordId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "monthlyIncome" DOUBLE PRECISION,
    "currentAddress" TEXT,
    "moveInDate" TIMESTAMP(3),
    "occupants" JSONB,
    "pets" JSONB,
    "documents" JSONB,
    "references" JSONB,
    "message" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "decisionNotes" TEXT,
    "leaseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmploymentInfo" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "employerName" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "income" DOUBLE PRECISION,
    "duration" TEXT,
    "address" TEXT,
    "proofDocument" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmploymentInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RequestApplication_publicId_key" ON "RequestApplication"("publicId");

-- CreateIndex
CREATE INDEX "RequestApplication_listingId_idx" ON "RequestApplication"("listingId");

-- CreateIndex
CREATE INDEX "RequestApplication_landlordId_idx" ON "RequestApplication"("landlordId");

-- CreateIndex
CREATE INDEX "RequestApplication_tenantId_idx" ON "RequestApplication"("tenantId");

-- CreateIndex
CREATE INDEX "RequestApplication_publicId_idx" ON "RequestApplication"("publicId");

-- CreateIndex
CREATE INDEX "RequestApplication_status_idx" ON "RequestApplication"("status");

-- CreateIndex
CREATE INDEX "EmploymentInfo_applicationId_idx" ON "EmploymentInfo"("applicationId");

-- AddForeignKey
ALTER TABLE "RequestApplication" ADD CONSTRAINT "RequestApplication_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestApplication" ADD CONSTRAINT "RequestApplication_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestApplication" ADD CONSTRAINT "RequestApplication_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestApplication" ADD CONSTRAINT "RequestApplication_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploymentInfo" ADD CONSTRAINT "EmploymentInfo_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "RequestApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
