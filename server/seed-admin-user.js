import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_USER_ID = "cmhcd6fgq000013vclrr1u7uw";

async function seedAdminUser() {
  try {
    console.log("🌱 Seeding data for admin user...\n");

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: ADMIN_USER_ID },
    });

    if (!user) {
      console.log("❌ User not found with ID:", ADMIN_USER_ID);
      return;
    }

    console.log(`✅ Found user: ${user.email} (${user.role})\n`);

    // Clean existing data for this user
    console.log("🧹 Cleaning existing data for this user...");
    await prisma.maintenanceRequest.deleteMany({
      where: {
        OR: [
          { userId: ADMIN_USER_ID },
          { listing: { landlordId: ADMIN_USER_ID } },
        ],
      },
    });
    await prisma.lease.deleteMany({
      where: { landlordId: ADMIN_USER_ID },
    });
    await prisma.listing.deleteMany({
      where: { landlordId: ADMIN_USER_ID },
    });

    // Create a tenant for testing
    console.log("👤 Creating/finding tenant user...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    let tenant = await prisma.user.findUnique({
      where: { email: "tenant@test.com" },
    });

    if (!tenant) {
      tenant = await prisma.user.create({
        data: {
          email: "tenant@test.com",
          password: hashedPassword,
          firstName: "Jane",
          lastName: "Tenant",
          role: "TENANT",
          phone: "555-0999",
        },
      });
    }

    console.log("🏠 Creating listings...");

    const listing1 = await prisma.listing.create({
      data: {
        landlordId: ADMIN_USER_ID,
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
        petDeposit: 500.0,
        availableDate: new Date(),
        description:
          "Beautiful modern apartment in downtown with stunning city views.",
        contactName: user.firstName + " " + user.lastName,
        phoneNumber: user.phone || "555-0100",
        email: user.email,
        amenities: {
          create: [{ name: "Gym" }, { name: "Pool" }, { name: "Parking" }],
        },
      },
    });

    const listing2 = await prisma.listing.create({
      data: {
        landlordId: ADMIN_USER_ID,
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
        description: "Spacious family home in quiet neighborhood.",
        contactName: user.firstName + " " + user.lastName,
        phoneNumber: user.phone || "555-0100",
        email: user.email,
        amenities: {
          create: [{ name: "Backyard" }, { name: "Garage" }],
        },
      },
    });

    const listing3 = await prisma.listing.create({
      data: {
        landlordId: ADMIN_USER_ID,
        title: "Studio Apartment",
        propertyType: "STUDIO",
        bedrooms: 0,
        bathrooms: 1,
        totalSquareFeet: 550,
        yearBuilt: 2019,
        country: "USA",
        state: "California",
        city: "Berkeley",
        streetAddress: "789 College Ave",
        zipCode: "94704",
        rentCycle: "MONTHLY",
        rentAmount: 2200.0,
        securityDeposit: 2200.0,
        availableDate: new Date(),
        description:
          "Efficient studio perfect for students or young professionals.",
        contactName: user.firstName + " " + user.lastName,
        phoneNumber: user.phone || "555-0100",
        email: user.email,
      },
    });

    console.log("📄 Creating leases...");

    const lease1 = await prisma.lease.create({
      data: {
        landlordId: ADMIN_USER_ID,
        tenantId: tenant.id,
        listingId: listing1.id,
        leaseStatus: "ACTIVE",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
        rentAmount: 3500.0,
        paymentFrequency: "MONTHLY",
        securityDeposit: 3500.0,
        paymentDay: 1,
      },
    });

    console.log("🔧 Creating maintenance requests...");

    // Maintenance request from tenant
    await prisma.maintenanceRequest.create({
      data: {
        userId: tenant.id,
        listingId: listing1.id,
        leaseId: lease1.id,
        title: "Leaking Faucet in Kitchen",
        description:
          "The kitchen faucet has been leaking for the past two days. Water drips constantly even when fully closed.",
        category: "PLUMBING",
        priority: "MEDIUM",
        status: "OPEN",
      },
    });

    await prisma.maintenanceRequest.create({
      data: {
        userId: tenant.id,
        listingId: listing1.id,
        leaseId: lease1.id,
        title: "Air Conditioning Not Working",
        description:
          "The AC unit stopped working yesterday. It makes noise but does not cool.",
        category: "HVAC",
        priority: "URGENT",
        status: "IN_PROGRESS",
      },
    });

    // Maintenance request from landlord (you)
    await prisma.maintenanceRequest.create({
      data: {
        userId: ADMIN_USER_ID,
        listingId: listing1.id,
        leaseId: lease1.id,
        title: "Annual HVAC Inspection",
        description:
          "Scheduled annual inspection and maintenance of the HVAC system.",
        category: "HVAC",
        priority: "LOW",
        status: "OPEN",
      },
    });

    await prisma.maintenanceRequest.create({
      data: {
        userId: ADMIN_USER_ID,
        listingId: listing2.id,
        leaseId: null,
        title: "Pre-rental Deep Cleaning",
        description:
          "Property needs professional deep cleaning before next tenant.",
        category: "CLEANING",
        priority: "HIGH",
        status: "IN_PROGRESS",
      },
    });

    await prisma.maintenanceRequest.create({
      data: {
        userId: ADMIN_USER_ID,
        listingId: listing2.id,
        leaseId: null,
        title: "Replace Broken Window",
        description: "Living room window has a crack and needs to be replaced.",
        category: "STRUCTURAL",
        priority: "HIGH",
        status: "OPEN",
      },
    });

    await prisma.maintenanceRequest.create({
      data: {
        userId: ADMIN_USER_ID,
        listingId: listing3.id,
        leaseId: null,
        title: "Paint Touch-ups",
        description:
          "Walls need paint touch-ups in multiple rooms before listing.",
        category: "OTHER",
        priority: "MEDIUM",
        status: "COMPLETED",
      },
    });

    console.log("\n✅ Seeding completed successfully!\n");

    console.log("═".repeat(70));
    console.log("📊 Summary");
    console.log("═".repeat(70));
    console.log(`\n👤 Admin User: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Role: ${user.role}\n`);

    console.log(`🏠 Listings Created: 3`);
    console.log(`   • ${listing1.title} - $${listing1.rentAmount}/month`);
    console.log(`   • ${listing2.title} - $${listing2.rentAmount}/month`);
    console.log(`   • ${listing3.title} - $${listing3.rentAmount}/month\n`);

    console.log(`📄 Active Leases: 1`);
    console.log(`   • ${listing1.title} → ${tenant.email}\n`);

    console.log(`🔧 Maintenance Requests: 6`);
    console.log(`   • OPEN: 3 requests`);
    console.log(`   • IN_PROGRESS: 2 requests`);
    console.log(`   • COMPLETED: 1 request\n`);

    console.log(
      `👤 Tenant for Testing: ${tenant.email} (password: password123)\n`
    );

    console.log("═".repeat(70));
    console.log("🎉 Ready! Refresh your app to see the new data.");
    console.log("═".repeat(70));
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdminUser();
