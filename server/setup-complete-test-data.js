import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function setupCompleteTestData() {
  try {
    console.log("🧹 Cleaning up existing data...");
    await prisma.maintenanceRequest.deleteMany();
    await prisma.lease.deleteMany();
    await prisma.listing.deleteMany();
    await prisma.user.deleteMany();

    console.log("👤 Creating landlord user...");
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

    console.log("👤 Creating tenant user...");
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

    console.log("🏠 Creating listings...");
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

    console.log("📄 Creating active lease...");
    const lease = await prisma.lease.create({
      data: {
        landlordId: landlord.id,
        tenantId: tenant.id,
        listingId: listing1.id,
        leaseStatus: "ACTIVE",
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        rentAmount: 3500.0,
        paymentFrequency: "MONTHLY",
        securityDeposit: 3500.0,
      },
    });

    console.log("🔧 Creating maintenance requests...");

    // Maintenance request from tenant
    const maintenance1 = await prisma.maintenanceRequest.create({
      data: {
        userId: tenant.id,
        listingId: listing1.id,
        leaseId: lease.id,
        title: "Leaking Faucet in Kitchen",
        description:
          "The kitchen faucet has been leaking for the past two days. Water drips constantly even when fully closed.",
        category: "PLUMBING",
        priority: "MEDIUM",
        status: "OPEN",
      },
    });

    // Maintenance request from landlord
    const maintenance2 = await prisma.maintenanceRequest.create({
      data: {
        userId: landlord.id,
        listingId: listing1.id,
        leaseId: lease.id,
        title: "Annual HVAC Inspection",
        description:
          "Scheduled annual inspection and maintenance of the HVAC system to ensure optimal performance.",
        category: "HVAC",
        priority: "LOW",
        status: "OPEN",
      },
    });

    // Another maintenance request from landlord for listing2 (no lease)
    const maintenance3 = await prisma.maintenanceRequest.create({
      data: {
        userId: landlord.id,
        listingId: listing2.id,
        leaseId: null,
        title: "Pre-rental Deep Cleaning",
        description:
          "Property needs professional deep cleaning before the next tenant moves in.",
        category: "CLEANING",
        priority: "HIGH",
        status: "IN_PROGRESS",
      },
    });

    console.log("\n✅ Complete test data setup successfully!\n");
    console.log("📊 Summary:");
    console.log("─".repeat(60));
    console.log(`👤 Landlord:`);
    console.log(`   Email: ${landlord.email}`);
    console.log(`   Password: password123`);
    console.log(`   ID: ${landlord.id}`);
    console.log(`   Role: ${landlord.role}`);
    console.log();
    console.log(`👤 Tenant:`);
    console.log(`   Email: ${tenant.email}`);
    console.log(`   Password: password123`);
    console.log(`   ID: ${tenant.id}`);
    console.log(`   Role: ${tenant.role}`);
    console.log();
    console.log(`🏠 Listings:`);
    console.log(`   1. ${listing1.title} (ID: ${listing1.id})`);
    console.log(`   2. ${listing2.title} (ID: ${listing2.id})`);
    console.log();
    console.log(`📄 Lease:`);
    console.log(`   Property: ${listing1.title}`);
    console.log(`   Tenant: ${tenant.email}`);
    console.log(`   Status: ${lease.leaseStatus}`);
    console.log(`   ID: ${lease.id}`);
    console.log();
    console.log(`🔧 Maintenance Requests:`);
    console.log(
      `   1. ${maintenance1.title} (Status: ${maintenance1.status}, Priority: ${maintenance1.priority})`
    );
    console.log(
      `   2. ${maintenance2.title} (Status: ${maintenance2.status}, Priority: ${maintenance2.priority})`
    );
    console.log(
      `   3. ${maintenance3.title} (Status: ${maintenance3.status}, Priority: ${maintenance3.priority})`
    );
    console.log("─".repeat(60));
    console.log(
      "\n🎉 You can now login and test the maintenance functionality!"
    );
  } catch (error) {
    console.error("❌ Error setting up test data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

setupCompleteTestData();
