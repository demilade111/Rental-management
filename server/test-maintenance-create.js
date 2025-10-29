import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

async function testMaintenanceCreate() {
  try {
    console.log("🧪 Testing maintenance creation...\n");

 
    const landlord = await prisma.user.findUnique({
      where: { email: "landlord@test.com" },
    });

    if (!landlord) {
      console.log("❌ Landlord not found");
      return;
    }

    console.log("✅ Found landlord:", landlord.email, "ID:", landlord.id);

    // Get landlord's listings
    const listings = await prisma.listing.findMany({
      where: { landlordId: landlord.id },
      select: { id: true, title: true, landlordId: true },
    });

    console.log("✅ Found", listings.length, "listings for landlord");
    listings.forEach((l) => {
      console.log("  -", l.title, "ID:", l.id);
      console.log("    Landlord ID:", l.landlordId);
      console.log("    Match:", l.landlordId === landlord.id ? "✅" : "❌");
    });

    if (listings.length === 0) {
      console.log("❌ No listings found for landlord");
      return;
    }

    const testListing = listings[0];
    console.log("\n📋 Testing with listing:", testListing.title);

    // Simulate the maintenance creation
    const maintenanceData = {
      title: "Test Maintenance Request",
      listingId: testListing.id,
      category: "PLUMBING",
      priority: "MEDIUM",
      description: "This is a test maintenance request to debug the 500 error.",
    };

    console.log("\n📝 Maintenance data:", maintenanceData);

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: testListing.id },
    });

    console.log("\n🏠 Listing verification:");
    console.log("  Found:", listing ? "✅" : "❌");
    if (listing) {
      console.log("  Title:", listing.title);
      console.log("  Landlord ID:", listing.landlordId);
      console.log("  User ID:", landlord.id);
      console.log("  Match:", listing.landlordId === landlord.id ? "✅" : "❌");
    }

    // Check for active lease
    const activeLease = await prisma.lease.findFirst({
      where: {
        listingId: testListing.id,
        leaseStatus: "ACTIVE",
      },
    });

    console.log("\n📄 Active lease:");
    console.log("  Found:", activeLease ? "✅" : "❌");
    if (activeLease) {
      console.log("  Lease ID:", activeLease.id);
    }

    // Try to create the maintenance request
    console.log("\n🔧 Creating maintenance request...");

    const maintenanceRequest = await prisma.maintenanceRequest.create({
      data: {
        userId: landlord.id,
        listingId: testListing.id,
        leaseId: activeLease ? activeLease.id : null,
        title: maintenanceData.title.trim(),
        description: maintenanceData.description.trim(),
        category: maintenanceData.category,
        priority: maintenanceData.priority || "MEDIUM",
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    console.log("\n✅ SUCCESS! Maintenance request created:");
    console.log("  ID:", maintenanceRequest.id);
    console.log("  Title:", maintenanceRequest.title);
    console.log("  Status:", maintenanceRequest.status);
    console.log("  Priority:", maintenanceRequest.priority);
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    console.error("Full error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testMaintenanceCreate();
