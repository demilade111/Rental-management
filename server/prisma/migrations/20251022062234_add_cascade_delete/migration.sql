-- DropForeignKey
ALTER TABLE "public"."ListingAmenity" DROP CONSTRAINT "ListingAmenity_listingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ListingImage" DROP CONSTRAINT "ListingImage_listingId_fkey";

-- AddForeignKey
ALTER TABLE "ListingAmenity" ADD CONSTRAINT "ListingAmenity_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingImage" ADD CONSTRAINT "ListingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
