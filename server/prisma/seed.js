import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log(" Starting database seeding...\n");

  console.log("🧹 Cleaning existing data...");
  await prisma.maintenanceRequest.deleteMany();
  await prisma.requestApplication.deleteMany();
  await prisma.lease.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listingAmenity.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  console.log("👥 Creating users...");

  const landlord1 = await prisma.user.create({
    data: {
      email: "landlord@test.com",
      password: hashedPassword,
      firstName: "John",
      lastName: "Landlord",
      role: "ADMIN",
      phone: "555-0101",
      profileImage: "https://i.pravatar.cc/150?img=12",
    },
  });

  const landlord2 = await prisma.user.create({
    data: {
      email: "sarah.property@test.com",
      password: hashedPassword,
      firstName: "Sarah",
      lastName: "Property",
      role: "ADMIN",
      phone: "555-0201",
      profileImage: "https://i.pravatar.cc/150?img=5",
    },
  });

  const tenant1 = await prisma.user.create({
    data: {
      email: "tenant@test.com",
      password: hashedPassword,
      firstName: "Jane",
      lastName: "Tenant",
      role: "TENANT",
      phone: "555-0102",
      profileImage: "https://i.pravatar.cc/150?img=1",
    },
  });

  const tenant2 = await prisma.user.create({
    data: {
      email: "mike.renter@test.com",
      password: hashedPassword,
      firstName: "Mike",
      lastName: "Renter",
      role: "TENANT",
      phone: "555-0202",
      profileImage: "https://i.pravatar.cc/150?img=15",
    },
  });

  console.log("🏠 Creating listings...");

  const listing1 = await prisma.listing.create({
    data: {
      landlordId: landlord1.id,
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
      availableDate: new Date("2024-01-01"),
      description:
        "Beautiful modern apartment in downtown with stunning city views. Features include hardwood floors, granite countertops, and stainless steel appliances.",
      contactName: "John Landlord",
      phoneNumber: "555-0101",
      email: "landlord@test.com",
      notes: "Pet-friendly building with gym and rooftop deck",
      amenities: {
        create: [
          { name: "Gym" },
          { name: "Pool" },
          { name: "Parking" },
          { name: "Elevator" },
          { name: "Laundry" },
        ],
      },
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
            isPrimary: true,
          },
          {
            url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
            isPrimary: false,
          },
        ],
      },
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      landlordId: landlord1.id,
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
      availableDate: new Date("2024-02-01"),
      description:
        "Spacious family home in quiet neighborhood with large backyard and modern updates.",
      contactName: "John Landlord",
      phoneNumber: "555-0101",
      email: "landlord@test.com",
      amenities: {
        create: [
          { name: "Backyard" },
          { name: "Garage" },
          { name: "Fireplace" },
        ],
      },
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
            isPrimary: true,
          },
        ],
      },
    },
  });

  const listing3 = await prisma.listing.create({
    data: {
      landlordId: landlord2.id,
      title: "Luxury Penthouse Suite",
      propertyType: "CONDO",
      bedrooms: 3,
      bathrooms: 3,
      totalSquareFeet: 2500,
      yearBuilt: 2022,
      country: "USA",
      state: "California",
      city: "San Francisco",
      streetAddress: "789 Sky Tower",
      zipCode: "94105",
      rentCycle: "MONTHLY",
      rentAmount: 8500.0,
      securityDeposit: 8500.0,
      availableDate: new Date(),
      description:
        "Stunning penthouse with panoramic city views, chef's kitchen, and premium finishes throughout.",
      contactName: "Sarah Property",
      phoneNumber: "555-0201",
      email: "sarah.property@test.com",
      amenities: {
        create: [
          { name: "Concierge" },
          { name: "Gym" },
          { name: "Pool" },
          { name: "Spa" },
          { name: "Valet Parking" },
        ],
      },
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00",
            isPrimary: true,
          },
        ],
      },
    },
  });

  const listing4 = await prisma.listing.create({
    data: {
      landlordId: landlord2.id,
      title: "Studio Apartment Downtown",
      propertyType: "STUDIO",
      bedrooms: 0,
      bathrooms: 1,
      totalSquareFeet: 550,
      yearBuilt: 2018,
      country: "USA",
      state: "California",
      city: "San Francisco",
      streetAddress: "321 Urban Loft",
      zipCode: "94103",
      rentCycle: "MONTHLY",
      rentAmount: 2200.0,
      securityDeposit: 2200.0,
      availableDate: new Date(),
      description:
        "Efficient studio perfect for young professionals. Walking distance to public transit.",
      contactName: "Sarah Property",
      phoneNumber: "555-0201",
      email: "sarah.property@test.com",
      amenities: {
        create: [{ name: "Laundry" }, { name: "Security" }],
      },
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9",
            isPrimary: true,
          },
        ],
      },
    },
  });

  console.log("📄 Creating leases...");

  const lease1 = await prisma.lease.create({
    data: {
      landlordId: landlord1.id,
      tenantId: tenant1.id,
      listingId: listing1.id,
      leaseStatus: "ACTIVE",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
      rentAmount: 3500.0,
      paymentFrequency: "MONTHLY",
      securityDeposit: 3500.0,
      paymentDay: 1,
      leaseTermType: "LONG_TERM",
      acceptsETransfer: true,
      acceptsDirectDebit: true,
      tenantFullName: "Jane Tenant",
      tenantEmail: "tenant@test.com",
      tenantPhone: "555-0102",
      landlordFullName: "John Landlord",
      landlordEmail: "landlord@test.com",
      landlordPhone: "555-0101",
    },
  });

  const lease2 = await prisma.lease.create({
    data: {
      landlordId: landlord2.id,
      tenantId: tenant2.id,
      listingId: listing4.id,
      leaseStatus: "ACTIVE",
      startDate: new Date("2024-03-01"),
      endDate: new Date("2025-02-28"),
      rentAmount: 2200.0,
      paymentFrequency: "MONTHLY",
      securityDeposit: 2200.0,
      paymentDay: 1,
      leaseTermType: "LONG_TERM",
      acceptsCheque: true,
      acceptsCash: true,
      tenantFullName: "Mike Renter",
      tenantEmail: "mike.renter@test.com",
      tenantPhone: "555-0202",
      landlordFullName: "Sarah Property",
      landlordEmail: "sarah.property@test.com",
      landlordPhone: "555-0201",
    },
  });

  console.log("🔧 Creating maintenance requests...");

  // Tenant requests for listing1/lease1
  await prisma.maintenanceRequest.create({
    data: {
      userId: tenant1.id,
      listingId: listing1.id,
      leaseId: lease1.id,
      title: "Leaking Faucet in Kitchen",
      description:
        "The kitchen faucet has been leaking for the past two days. Water drips constantly even when fully closed. Please send someone to fix it.",
      category: "PLUMBING",
      priority: "MEDIUM",
      status: "OPEN",
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7",
          },
        ],
      },
    },
  });

  await prisma.maintenanceRequest.create({
    data: {
      userId: tenant1.id,
      listingId: listing1.id,
      leaseId: lease1.id,
      title: "Air Conditioning Not Working",
      description:
        "The AC unit stopped working yesterday. It makes a strange noise when turned on but does not cool the apartment.",
      category: "HVAC",
      priority: "URGENT",
      status: "IN_PROGRESS",
    },
  });

  // Landlord requests for listing1
  await prisma.maintenanceRequest.create({
    data: {
      userId: landlord1.id,
      listingId: listing1.id,
      leaseId: lease1.id,
      title: "Annual HVAC Inspection",
      description:
        "Scheduled annual inspection and maintenance of the HVAC system to ensure optimal performance and compliance.",
      category: "HVAC",
      priority: "LOW",
      status: "OPEN",
    },
  });

  await prisma.maintenanceRequest.create({
    data: {
      userId: landlord1.id,
      listingId: listing2.id,
      leaseId: null,
      title: "Pre-rental Deep Cleaning",
      description:
        "Property needs professional deep cleaning before the next tenant moves in. All rooms, carpets, and appliances.",
      category: "CLEANING",
      priority: "HIGH",
      status: "IN_PROGRESS",
    },
  });

  await prisma.maintenanceRequest.create({
    data: {
      userId: landlord1.id,
      listingId: listing2.id,
      leaseId: null,
      title: "Landscape Maintenance",
      description:
        "Backyard needs lawn mowing, hedge trimming, and general landscaping before showing to potential tenants.",
      category: "LANDSCAPING",
      priority: "MEDIUM",
      status: "COMPLETED",
    },
  });

  // Tenant requests for listing4/lease2
  await prisma.maintenanceRequest.create({
    data: {
      userId: tenant2.id,
      listingId: listing4.id,
      leaseId: lease2.id,
      title: "Broken Door Lock",
      description:
        "The front door lock is very difficult to turn and sometimes gets stuck. I am concerned about security.",
      category: "SECURITY",
      priority: "HIGH",
      status: "OPEN",
    },
  });

  await prisma.maintenanceRequest.create({
    data: {
      userId: tenant2.id,
      listingId: listing4.id,
      leaseId: lease2.id,
      title: "Refrigerator Making Noise",
      description:
        "The refrigerator is making a loud buzzing noise, especially at night. It is still cooling but very annoying.",
      category: "APPLIANCE",
      priority: "LOW",
      status: "COMPLETED",
    },
  });
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
