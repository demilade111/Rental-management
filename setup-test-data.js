const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function setupTestData() {
  try {
    console.log("🧹 Cleaning up existing data...");
    await prisma.maintenanceRequest.deleteMany();
    await prisma.lease.deleteMany();
    await prisma.listing.deleteMany();
    await prisma.user.deleteMany();

    console.log("👤 Creating test users...");

    const hashedPassword = await bcrypt.hash("password123", 10);

    const landlord = await prisma.user.create({
      data: {
        email: "landlord@test.com",
        password: hashedPassword,
        firstName: "John",
        lastName: "Landlord",
        role: "ADMIN",
        phone: "555-0101",
      },
    });

    const tenant = await prisma.user.create({
      data: {
        email: "tenant@test.com",
        password: hashedPassword,
        firstName: "Jane",
        lastName: "Tenant",
        role: "TENANT",
        phone: "555-0102",
      },
    });

    console.log("Creating test listings...");

    const listing1 = await prisma.listing.create({
      data: {
        landlordId: landlord.id,
        title: "Modern Downtown Apartment",
        propertyType: "APARTMENT",
        bedrooms: 2,
        bathrooms: 2,
        totalSquareFeet: 1200,
        yearBuilt: 2020,
        country: "USA",
        state: "California",
        city: "San Francisco",
        streetAddress: "123 Main St",
        zipCode: "94102",
        rentCycle: "MONTHLY",
        rentAmount: 3500.0,
        securityDeposit: 3500.0,
        availableDate: new Date(),
        description: "Beautiful modern apartment in downtown",
        contactName: "John Landlord",
        phoneNumber: "555-0101",
        email: "landlord@test.com",
      },
    });

    const listing2 = await prisma.listing.create({
      data: {
        landlordId: landlord.id,
        title: "Cozy Suburban House",
        propertyType: "SINGLE_FAMILY",
        bedrooms: 3,
        bathrooms: 2,
        totalSquareFeet: 1800,
        yearBuilt: 2015,
        country: "USA",
        state: "California",
        city: "Oakland",
        streetAddress: "456 Oak Ave",
        zipCode: "94601",
        rentCycle: "MONTHLY",
        rentAmount: 4200.0,
        securityDeposit: 4200.0,
        availableDate: new Date(),
        description: "Spacious family home in quiet neighborhood",
        contactName: "John Landlord",
        phoneNumber: "555-0101",
        email: "landlord@test.com",
      },
    });

    console.log("Creating test leases...");

    const lease = await prisma.lease.create({
      data: {
        landlordId: landlord.id,
        tenantId: tenant.id,
        listingId: listing1.id,
        leaseStatus: "ACTIVE",
        leaseStartDate: new Date(),
        leaseEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        rentAmount: 3500.0,
        rentCycle: "MONTHLY",
        securityDeposit: 3500.0,
      },
    });

    console.log("\n Test data setup complete!");
    console.log("\nSummary:");
    console.log(`  Landlord: ${landlord.email} (password: password123)`);
    console.log(`  Tenant: ${tenant.email} (password: password123)`);
    console.log(`  Listings: ${listing1.title}, ${listing2.title}`);
    console.log(`  Active Lease: ${listing1.title} -> ${tenant.email}`);
  } catch (error) {
    console.error("❌ Error setting up test data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestData();
