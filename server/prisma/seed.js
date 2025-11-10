import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...\n");

  console.log("Cleaning existing data...");
  await prisma.notification.deleteMany();
  await prisma.maintenanceMessage.deleteMany();
  await prisma.maintenanceImage.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.employmentInfo.deleteMany();
  await prisma.requestApplication.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.leaseInvite.deleteMany();
  await prisma.customLease.deleteMany();
  await prisma.lease.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listingAmenity.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  console.log("👥 Creating users (20 tenants + 3 landlords)...");

  const landlord1 = await prisma.user.create({
    data: {
      email: "landlord@test.com",
      password: hashedPassword,
      firstName: "John",
      lastName: "Landlord",
      role: "ADMIN",
      phone: "+1 (555) 010-1001",
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
      phone: "+1 (555) 020-1002",
      profileImage: "https://i.pravatar.cc/150?img=5",
    },
  });

  const landlord3 = await prisma.user.create({
    data: {
      email: "david.estates@test.com",
      password: hashedPassword,
      firstName: "David",
      lastName: "Estates",
      role: "ADMIN",
      phone: "+1 (555) 030-1003",
      profileImage: "https://i.pravatar.cc/150?img=13",
    },
  });

  // Create 20 tenants
  const tenants = [];
  const tenantData = [
    { email: "tenant@test.com", firstName: "Jane", lastName: "Tenant", img: 1 },
    { email: "mike.renter@test.com", firstName: "Mike", lastName: "Renter", img: 15 },
    { email: "emma.wilson@test.com", firstName: "Emma", lastName: "Wilson", img: 9 },
    { email: "alex.chen@test.com", firstName: "Alex", lastName: "Chen", img: 33 },
    { email: "lisa.martinez@test.com", firstName: "Lisa", lastName: "Martinez", img: 10 },
    { email: "robert.johnson@test.com", firstName: "Robert", lastName: "Johnson", img: 52 },
    { email: "sophia.brown@test.com", firstName: "Sophia", lastName: "Brown", img: 23 },
    { email: "james.davis@test.com", firstName: "James", lastName: "Davis", img: 51 },
    { email: "olivia.taylor@test.com", firstName: "Olivia", lastName: "Taylor", img: 25 },
    { email: "william.anderson@test.com", firstName: "William", lastName: "Anderson", img: 32 },
    { email: "ava.thomas@test.com", firstName: "Ava", lastName: "Thomas", img: 16 },
    { email: "noah.jackson@test.com", firstName: "Noah", lastName: "Jackson", img: 60 },
    { email: "isabella.white@test.com", firstName: "Isabella", lastName: "White", img: 44 },
    { email: "ethan.harris@test.com", firstName: "Ethan", lastName: "Harris", img: 68 },
    { email: "mia.clark@test.com", firstName: "Mia", lastName: "Clark", img: 27 },
    { email: "lucas.lewis@test.com", firstName: "Lucas", lastName: "Lewis", img: 56 },
    { email: "charlotte.walker@test.com", firstName: "Charlotte", lastName: "Walker", img: 20 },
    { email: "benjamin.hall@test.com", firstName: "Benjamin", lastName: "Hall", img: 70 },
    { email: "amelia.allen@test.com", firstName: "Amelia", lastName: "Allen", img: 26 },
    { email: "henry.young@test.com", firstName: "Henry", lastName: "Young", img: 54 },
  ];

  for (let i = 0; i < tenantData.length; i++) {
    const tenant = await prisma.user.create({
      data: {
        email: tenantData[i].email,
        password: hashedPassword,
        firstName: tenantData[i].firstName,
        lastName: tenantData[i].lastName,
        role: "TENANT",
        phone: `+1 (555) ${String(i + 100).padStart(3, '0')}-200${i}`,
        profileImage: `https://i.pravatar.cc/150?img=${tenantData[i].img}`,
      },
    });
    tenants.push(tenant);
  }

  console.log("🏠 Creating 20 listings...");

  const listings = [];
  const listingData = [
    {
      landlord: landlord1,
      title: "Modern Downtown Apartment",
      type: "APARTMENT",
      beds: 2, baths: 2, sqft: 1200, year: 2020,
      street: "123 Main St, Apt 4B", city: "San Francisco", state: "California", zip: "94102",
      rent: 3500, deposit: 3500, petDeposit: 500,
      status: "RENTED",
      desc: "Beautiful modern apartment in downtown with stunning city views. Features include hardwood floors, granite countertops, and stainless steel appliances. Walking distance to shops, restaurants, and public transit.",
      amenities: ["Gym", "Swimming Pool", "Parking", "Elevator", "In-unit Laundry", "Air Conditioning", "Dishwasher"],
    },
    {
      landlord: landlord1,
      title: "Cozy Suburban House",
      type: "SINGLE_FAMILY",
      beds: 3, baths: 2, sqft: 1800, year: 2015,
      street: "456 Oak Ave", city: "Oakland", state: "California", zip: "94601",
      rent: 4200, deposit: 4200, petDeposit: 0,
      status: "ACTIVE",
      desc: "Spacious family home in quiet neighborhood with large backyard and modern updates. Perfect for families with children or pets. Recently renovated kitchen and bathrooms.",
      amenities: ["Backyard", "Garage", "Fireplace", "Central Heating", "Dishwasher"],
    },
    {
      landlord: landlord1,
      title: "Luxury Condo with Bay View",
      type: "CONDO",
      beds: 2, baths: 2.5, sqft: 1400, year: 2021,
      street: "789 Bay View Blvd, Unit 12", city: "San Francisco", state: "California", zip: "94105",
      rent: 4800, deposit: 4800, petDeposit: 0,
      status: "ACTIVE",
      desc: "Stunning luxury condo with panoramic bay views. Floor-to-ceiling windows, high-end finishes, and access to building amenities including concierge service.",
      amenities: ["Concierge", "Pool", "Gym", "Parking", "Balcony", "In-unit Laundry", "Air Conditioning"],
    },
    {
      landlord: landlord2,
      title: "Charming Victorian Townhouse",
      type: "TOWNHOUSE",
      beds: 3, baths: 2.5, sqft: 2000, year: 1905,
      street: "321 Heritage Lane", city: "San Francisco", state: "California", zip: "94110",
      rent: 5200, deposit: 5200, petDeposit: 750,
      status: "RENTED",
      desc: "Historic Victorian townhouse with original details and modern amenities. Three stories with hardwood floors, crown molding, and a private patio.",
      amenities: ["Patio", "Fireplace", "Hardwood Floors", "Updated Kitchen", "Parking"],
    },
    {
      landlord: landlord2,
      title: "Studio in Mission District",
      type: "STUDIO",
      beds: 0, baths: 1, sqft: 500, year: 2018,
      street: "555 Mission St, #203", city: "San Francisco", state: "California", zip: "94103",
      rent: 2200, deposit: 2200, petDeposit: 0,
      status: "ACTIVE",
      desc: "Efficient studio in the heart of Mission District. Perfect for young professionals. Recently renovated with modern appliances.",
      amenities: ["In-unit Laundry", "Hardwood Floors", "Air Conditioning"],
    },
    {
      landlord: landlord2,
      title: "Spacious 4BR Family Home",
      type: "SINGLE_FAMILY",
      beds: 4, baths: 3, sqft: 2500, year: 2010,
      street: "890 Elm Street", city: "Berkeley", state: "California", zip: "94702",
      rent: 5500, deposit: 5500, petDeposit: 1000,
      status: "RENTED",
      desc: "Large family home with spacious rooms, updated kitchen, and beautiful backyard. Close to schools and parks.",
      amenities: ["Backyard", "Garage", "Central AC", "Fireplace", "Dishwasher", "Laundry Room"],
    },
    {
      landlord: landlord1,
      title: "Modern Loft in SOMA",
      type: "APARTMENT",
      beds: 1, baths: 1, sqft: 900, year: 2019,
      street: "234 Howard St, #5A", city: "San Francisco", state: "California", zip: "94105",
      rent: 3800, deposit: 3800, petDeposit: 0,
      status: "ACTIVE",
      desc: "Industrial-style loft with exposed brick, high ceilings, and modern finishes. Perfect for creative professionals.",
      amenities: ["High Ceilings", "Exposed Brick", "In-unit Laundry", "Gym", "Roof Deck"],
    },
    {
      landlord: landlord3,
      title: "Penthouse Suite Downtown",
      type: "APARTMENT",
      beds: 3, baths: 3, sqft: 2200, year: 2022,
      street: "100 Market St, Penthouse", city: "San Francisco", state: "California", zip: "94111",
      rent: 7500, deposit: 7500, petDeposit: 0,
      status: "ACTIVE",
      desc: "Luxurious penthouse with 360-degree city views. Top-floor living with premium finishes and private elevator access.",
      amenities: ["Private Elevator", "Terrace", "Gym", "Concierge", "Parking", "In-unit Laundry", "Smart Home"],
    },
    {
      landlord: landlord3,
      title: "Garden Apartment with Patio",
      type: "APARTMENT",
      beds: 1, baths: 1, sqft: 750, year: 2017,
      street: "678 Green St, #1A", city: "San Francisco", state: "California", zip: "94133",
      rent: 2800, deposit: 2800, petDeposit: 500,
      status: "RENTED",
      desc: "Ground-floor apartment with private patio and garden access. Pet-friendly and quiet location.",
      amenities: ["Patio", "Garden Access", "Parking", "Storage", "Pet Friendly"],
    },
    {
      landlord: landlord1,
      title: "Renovated 2BR in Sunset",
      type: "APARTMENT",
      beds: 2, baths: 1, sqft: 1000, year: 2016,
      street: "456 Sunset Blvd, #3B", city: "San Francisco", state: "California", zip: "94122",
      rent: 3200, deposit: 3200, petDeposit: 0,
      status: "ACTIVE",
      desc: "Freshly renovated 2-bedroom in quiet Sunset neighborhood. New kitchen and bathroom, hardwood floors throughout.",
      amenities: ["Hardwood Floors", "Updated Kitchen", "Storage", "Laundry in Building"],
    },
    {
      landlord: landlord2,
      title: "Executive Condo in Financial District",
      type: "CONDO",
      beds: 2, baths: 2, sqft: 1300, year: 2020,
      street: "200 Pine St, Unit 25", city: "San Francisco", state: "California", zip: "94104",
      rent: 5000, deposit: 5000, petDeposit: 0,
      status: "RENTED",
      desc: "High-end condo perfect for executives. Walking distance to major offices and public transit.",
      amenities: ["Concierge", "Gym", "Pool", "Parking", "In-unit Laundry", "City Views"],
    },
    {
      landlord: landlord3,
      title: "Duplex with Ocean View",
      type: "MULTI_FAMILY",
      beds: 3, baths: 2, sqft: 1900, year: 2012,
      street: "789 Ocean Ave", city: "San Francisco", state: "California", zip: "94112",
      rent: 4500, deposit: 4500, petDeposit: 750,
      status: "ACTIVE",
      desc: "Beautiful duplex with ocean views. Two-level living with private entrance and garage.",
      amenities: ["Ocean View", "Garage", "Backyard", "Fireplace", "Storage"],
    },
    {
      landlord: landlord1,
      title: "Budget-Friendly Studio",
      type: "STUDIO",
      beds: 0, baths: 1, sqft: 400, year: 2015,
      street: "111 Valencia St, #12", city: "San Francisco", state: "California", zip: "94110",
      rent: 1800, deposit: 1800, petDeposit: 0,
      status: "ACTIVE",
      desc: "Affordable studio perfect for students or young professionals. Close to BART and nightlife.",
      amenities: ["Laundry in Building", "Bike Storage"],
    },
    {
      landlord: landlord2,
      title: "Contemporary Loft with Skylights",
      type: "APARTMENT",
      beds: 2, baths: 2, sqft: 1600, year: 2021,
      street: "345 Folsom St, #8C", city: "San Francisco", state: "California", zip: "94107",
      rent: 4300, deposit: 4300, petDeposit: 0,
      status: "ACTIVE",
      desc: "Bright and airy loft with skylights and modern design. Open floor plan perfect for entertaining.",
      amenities: ["Skylights", "Open Floor Plan", "In-unit Laundry", "Parking", "Gym", "Roof Deck"],
    },
    {
      landlord: landlord3,
      title: "Classic 1BR in Nob Hill",
      type: "APARTMENT",
      beds: 1, baths: 1, sqft: 700, year: 1960,
      street: "987 California St, #4D", city: "San Francisco", state: "California", zip: "94108",
      rent: 2600, deposit: 2600, petDeposit: 0,
      status: "RENTED",
      desc: "Classic apartment in prestigious Nob Hill. Well-maintained building with doorman service.",
      amenities: ["Doorman", "Elevator", "Laundry in Building", "Storage"],
    },
    {
      landlord: landlord1,
      title: "Waterfront Condo",
      type: "CONDO",
      beds: 2, baths: 2, sqft: 1250, year: 2018,
      street: "567 Embarcadero, #15B", city: "San Francisco", state: "California", zip: "94111",
      rent: 5200, deposit: 5200, petDeposit: 0,
      status: "ACTIVE",
      desc: "Stunning waterfront condo with bay views. Premium building with resort-style amenities.",
      amenities: ["Bay Views", "Gym", "Pool", "Concierge", "Parking", "In-unit Laundry", "Storage"],
    },
    {
      landlord: landlord2,
      title: "Family House in Presidio Heights",
      type: "SINGLE_FAMILY",
      beds: 4, baths: 3.5, sqft: 3000, year: 2005,
      street: "432 Presidio Ave", city: "San Francisco", state: "California", zip: "94115",
      rent: 8500, deposit: 8500, petDeposit: 1500,
      status: "RENTED",
      desc: "Elegant family home in exclusive Presidio Heights. Large rooms, gourmet kitchen, and manicured garden.",
      amenities: ["Garden", "Garage", "Fireplace", "Central AC", "Updated Kitchen", "Hardwood Floors"],
    },
    {
      landlord: landlord3,
      title: "Converted Warehouse Loft",
      type: "APARTMENT",
      beds: 2, baths: 2, sqft: 1800, year: 2017,
      street: "890 Brannan St, #3", city: "San Francisco", state: "California", zip: "94103",
      rent: 4600, deposit: 4600, petDeposit: 500,
      status: "ACTIVE",
      desc: "Unique warehouse conversion with industrial charm. High ceilings, exposed beams, and modern amenities.",
      amenities: ["High Ceilings", "Exposed Beams", "In-unit Laundry", "Parking", "Pet Friendly"],
    },
    {
      landlord: landlord1,
      title: "Affordable 2BR in Richmond",
      type: "APARTMENT",
      beds: 2, baths: 1, sqft: 950, year: 2010,
      street: "234 Clement St, #2F", city: "San Francisco", state: "California", zip: "94121",
      rent: 2900, deposit: 2900, petDeposit: 0,
      status: "ACTIVE",
      desc: "Affordable 2-bedroom in family-friendly Richmond District. Close to parks, shops, and restaurants.",
      amenities: ["Laundry in Building", "Storage", "Parking Available"],
    },
    {
      landlord: landlord2,
      title: "Designer Townhouse",
      type: "TOWNHOUSE",
      beds: 3, baths: 3, sqft: 2200, year: 2019,
      street: "567 Castro St", city: "San Francisco", state: "California", zip: "94114",
      rent: 6500, deposit: 6500, petDeposit: 1000,
      status: "RENTED",
      desc: "Beautifully designed townhouse with high-end finishes. Private rooftop deck with city views.",
      amenities: ["Roof Deck", "Garage", "In-unit Laundry", "Smart Home", "Designer Finishes"],
    },
  ];

  for (const data of listingData) {
    const listing = await prisma.listing.create({
      data: {
        landlordId: data.landlord.id,
        title: data.title,
        propertyType: data.type,
        bedrooms: data.beds,
        bathrooms: data.baths,
        totalSquareFeet: data.sqft,
        yearBuilt: data.year,
        country: "USA",
        state: data.state,
        city: data.city,
        streetAddress: data.street,
        zipCode: data.zip,
        rentCycle: "MONTHLY",
        rentAmount: data.rent,
        securityDeposit: data.deposit,
        petDeposit: data.petDeposit,
        availableDate: new Date("2024-01-01"),
        status: data.status,
        description: data.desc,
        contactName: `${data.landlord.firstName} ${data.landlord.lastName}`,
        phoneNumber: data.landlord.phone,
        email: data.landlord.email,
        notes: data.petDeposit > 0 ? "Pet-friendly property" : "No pets allowed",
        amenities: {
          create: data.amenities.map(a => ({ name: a })),
        },
        images: {
          create: [
            { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267", isPrimary: true },
            { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2", isPrimary: false },
          ],
        },
      },
    });
    listings.push(listing);
  }

  console.log("📋 Creating 20+ applications...");

  const applications = [];
  const applicationStatuses = ["NEW", "PENDING", "APPROVED", "REJECTED"];
  
  for (let i = 0; i < 20; i++) {
    const tenant = tenants[i];
    const listing = listings[i % listings.length];
    const status = applicationStatuses[Math.floor(Math.random() * applicationStatuses.length)];
    const daysAgo = Math.floor(Math.random() * 60) + 1;
    const publicId = `APP-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 9)}`;
    
    const app = await prisma.requestApplication.create({
      data: {
        publicId: publicId,
        tenantId: tenant.id,
        landlordId: listing.landlordId,
        listingId: listing.id,
        fullName: `${tenant.firstName} ${tenant.lastName}`,
        email: tenant.email,
        phone: tenant.phone,
        moveInDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
        currentAddress: `${Math.floor(Math.random() * 9999)} ${["Main", "Oak", "Pine", "Maple", "Cedar"][Math.floor(Math.random() * 5)]} St`,
        monthlyIncome: Math.floor(Math.random() * 8000) + 4000,
        status: status,
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      },
    });
    applications.push(app);
  }

  console.log("📝 Creating 15+ leases...");

  const leases = [];
  const leaseData = [
    { tenant: tenants[0], listing: listings[0], status: "ACTIVE", startDays: -180, endDays: 180 },
    { tenant: tenants[1], listing: listings[3], status: "ACTIVE", startDays: -90, endDays: 270 },
    { tenant: tenants[2], listing: listings[5], status: "ACTIVE", startDays: -30, endDays: 335 },
    { tenant: tenants[3], listing: listings[8], status: "ACTIVE", startDays: -120, endDays: 240 },
    { tenant: tenants[4], listing: listings[10], status: "ACTIVE", startDays: -60, endDays: 305 },
    { tenant: tenants[5], listing: listings[14], status: "ACTIVE", startDays: -15, endDays: 350 },
    { tenant: tenants[6], listing: listings[16], status: "ACTIVE", startDays: -200, endDays: 165 },
    { tenant: tenants[7], listing: listings[18], status: "ACTIVE", startDays: -250, endDays: 115 },
    { tenant: tenants[8], listing: listings[6], status: "DRAFT", startDays: 30, endDays: 395 },
    { tenant: tenants[9], listing: listings[9], status: "DRAFT", startDays: 45, endDays: 410 },
    { tenant: tenants[10], listing: listings[12], status: "DRAFT", startDays: 60, endDays: 425 },
    { tenant: tenants[11], listing: listings[1], status: "DRAFT", startDays: 90, endDays: 455 },
    { tenant: tenants[12], listing: listings[4], status: "ACTIVE", startDays: -340, endDays: 25 },
    { tenant: tenants[13], listing: listings[7], status: "ACTIVE", startDays: -320, endDays: 45 },
    { tenant: tenants[14], listing: listings[11], status: "ACTIVE", startDays: -300, endDays: 65 },
  ];

  for (const data of leaseData) {
    const startDate = new Date(Date.now() + data.startDays * 24 * 60 * 60 * 1000);
    const endDate = new Date(Date.now() + data.endDays * 24 * 60 * 60 * 1000);
    
    const lease = await prisma.lease.create({
      data: {
        listing: { connect: { id: data.listing.id } },
        tenant: { connect: { id: data.tenant.id } },
        landlord: { connect: { id: data.listing.landlordId } },
        leaseStatus: data.status,
        startDate: startDate,
        endDate: endDate,
        rentAmount: data.listing.rentAmount,
        paymentFrequency: data.listing.rentCycle,
        securityDeposit: data.listing.securityDeposit,
      },
    });
    leases.push(lease);
  }

  console.log("📑 Creating 15+ custom leases...");

  const customLeases = [];
  const customLeaseData = [
    { tenant: tenants[15], listing: listings[2], status: "ACTIVE", startDays: -60, months: 12, rent: 4800 },
    { tenant: tenants[16], listing: listings[13], status: "DRAFT", startDays: 15, months: 12, rent: 4200 },
    { tenant: tenants[17], listing: listings[15], status: "DRAFT", startDays: 30, months: 6, rent: 3500 },
    { tenant: tenants[18], listing: listings[17], status: "ACTIVE", startDays: -120, months: 12, rent: 5800 },
    { tenant: tenants[19], listing: listings[19], status: "ACTIVE", startDays: -30, months: 12, rent: 4100 },
    { tenant: tenants[0], listing: listings[2], status: "DRAFT", startDays: 60, months: 6, rent: 4800 },
    { tenant: tenants[1], listing: listings[4], status: "DRAFT", startDays: 20, months: 12, rent: 2200 },
    { tenant: tenants[2], listing: listings[7], status: "ACTIVE", startDays: -90, months: 24, rent: 7500 },
    { tenant: tenants[3], listing: listings[9], status: "ACTIVE", startDays: -45, months: 12, rent: 2800 },
    { tenant: tenants[4], listing: listings[11], status: "ACTIVE", startDays: -180, months: 18, rent: 5000 },
    { tenant: tenants[5], listing: listings[13], status: "DRAFT", startDays: 45, months: 12, rent: 4200 },
    { tenant: tenants[6], listing: listings[15], status: "DRAFT", startDays: 10, months: 12, rent: 3500 },
    { tenant: tenants[7], listing: listings[17], status: "ACTIVE", startDays: -210, months: 12, rent: 5800 },
    { tenant: tenants[8], listing: listings[19], status: "ACTIVE", startDays: -75, months: 12, rent: 4100 },
    { tenant: tenants[9], listing: listings[1], status: "ACTIVE", startDays: -150, months: 12, rent: 4200 },
  ];

  for (const data of customLeaseData) {
    const startDate = new Date(Date.now() + data.startDays * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + data.months * 30 * 24 * 60 * 60 * 1000);
    
    const customLease = await prisma.customLease.create({
      data: {
        listing: { connect: { id: data.listing.id } },
        tenant: { connect: { id: data.tenant.id } },
        landlord: { connect: { id: data.listing.landlordId } },
        leaseName: `Custom Lease - ${data.listing.title}`,
        leaseStatus: data.status,
        startDate: startDate,
        endDate: endDate,
        rentAmount: data.rent,
        paymentFrequency: "MONTHLY",
        paymentDay: 1,
        securityDeposit: data.rent,
        depositAmount: data.rent,
        paymentMethod: ["BANK_TRANSFER", "CHECK", "CASH"][Math.floor(Math.random() * 3)],
        fileUrl: `/leases/custom-lease-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.pdf`,
      },
    });
    customLeases.push(customLease);
  }

  console.log("💰 Creating 40+ payments...");

  const payments = [];
  
  // Create payments for active leases
  for (let i = 0; i < leases.length; i++) {
    const lease = leases[i];
    if (lease.leaseStatus !== "ACTIVE") continue;
    
    // Find the listing to get landlordId
    const listing = listings.find(l => l.id === lease.listingId);
    if (!listing) continue;
    
    const monthsSinceStart = Math.floor((Date.now() - lease.startDate.getTime()) / (30 * 24 * 60 * 60 * 1000));
    
    // Create past payments (paid)
    for (let month = 0; month < Math.min(monthsSinceStart, 6); month++) {
      const dueDate = new Date(lease.startDate.getTime() + month * 30 * 24 * 60 * 60 * 1000);
      const paidDate = new Date(dueDate.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000);
      const monthName = dueDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      
      await prisma.payment.create({
        data: {
          leaseId: lease.id,
          tenantId: lease.tenantId,
          landlordId: listing.landlordId,
          amount: lease.rentAmount,
          dueDate: dueDate,
          paidDate: paidDate,
          type: "RENT",
          status: "PAID",
          paymentMethod: ["BANK_TRANSFER", "CHECK", "CASH", "CREDIT_CARD"][Math.floor(Math.random() * 4)],
          notes: `Monthly rent payment for ${monthName}`,
        },
      });
    }
    
    // Current month payment (pending or overdue)
    const currentDueDate = new Date(lease.startDate.getTime() + monthsSinceStart * 30 * 24 * 60 * 60 * 1000);
    const isPastDue = currentDueDate < new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    const currentMonthName = currentDueDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    
    if (monthsSinceStart >= 0) {
      await prisma.payment.create({
        data: {
          leaseId: lease.id,
          tenantId: lease.tenantId,
          landlordId: listing.landlordId,
          amount: lease.rentAmount,
          dueDate: currentDueDate,
          type: "RENT",
          status: "PENDING",
          notes: isPastDue ? `OVERDUE: Monthly rent for ${currentMonthName}` : `Monthly rent for ${currentMonthName}`,
        },
      });
    }
    
    // Security deposit payment
    if (lease.securityDeposit > 0) {
      await prisma.payment.create({
        data: {
          leaseId: lease.id,
          tenantId: lease.tenantId,
          landlordId: listing.landlordId,
          amount: lease.securityDeposit,
          dueDate: lease.startDate,
          paidDate: lease.startDate,
          type: "DEPOSIT",
          status: "PAID",
          paymentMethod: "BANK_TRANSFER",
          notes: "Security deposit payment",
        },
      });
    }
  }

  // Create maintenance payments
  for (let i = 0; i < 10; i++) {
    const listing = listings[i % listings.length];
    const daysAgo = Math.floor(Math.random() * 90) + 1;
    const isPaid = Math.random() > 0.3;
    const dueDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const isOverdue = !isPaid && dueDate < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    await prisma.payment.create({
      data: {
        landlordId: listing.landlordId,
        amount: Math.floor(Math.random() * 500) + 100,
        dueDate: dueDate,
        paidDate: isPaid ? new Date(dueDate.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000) : null,
        type: "MAINTENANCE",
        status: isPaid ? "PAID" : "PENDING",
        paymentMethod: isPaid ? ["BANK_TRANSFER", "CHECK", "CREDIT_CARD"][Math.floor(Math.random() * 3)] : null,
        notes: ["HVAC Repair", "Plumbing Fix", "Electrical Work", "Appliance Replacement", "Painting"][Math.floor(Math.random() * 5)],
      },
    });
  }

  console.log("🔧 Creating 25+ maintenance requests...");

  const maintenanceIssues = [
    { title: "Air Conditioning Not Working", desc: "AC unit not cooling properly. Thermostat shows correct temperature but air coming out is warm.", priority: "HIGH", category: "HVAC" },
    { title: "Leaking Faucet in Kitchen", desc: "Kitchen sink faucet has a constant drip that's getting worse.", priority: "MEDIUM", category: "PLUMBING" },
    { title: "Pre-rental Deep Cleaning", desc: "Full deep cleaning needed before new tenant moves in next month.", priority: "LOW", category: "CLEANING" },
    { title: "Broken Garbage Disposal", desc: "Garbage disposal is jammed and not working. Making loud grinding noise.", priority: "MEDIUM", category: "APPLIANCE" },
    { title: "Water Heater Issue", desc: "No hot water in the morning. Water heater may need replacement.", priority: "HIGH", category: "PLUMBING" },
    { title: "Refrigerator Not Cooling", desc: "Fridge stopped cooling. Food is spoiling.", priority: "URGENT", category: "APPLIANCE" },
    { title: "Broken Window Lock", desc: "Window lock in bedroom is broken, security concern.", priority: "HIGH", category: "SECURITY" },
    { title: "Pest Control Service", desc: "Regular quarterly pest control service needed.", priority: "LOW", category: "PEST_CONTROL" },
    { title: "Clogged Bathroom Drain", desc: "Bathroom sink draining very slowly, standing water.", priority: "MEDIUM", category: "PLUMBING" },
    { title: "Smoke Detector Beeping", desc: "Smoke detector beeping intermittently, needs battery or replacement.", priority: "HIGH", category: "SECURITY" },
    { title: "Leaking Roof", desc: "Water stain on ceiling, appears to be roof leak.", priority: "URGENT", category: "STRUCTURAL" },
    { title: "Broken Dishwasher", desc: "Dishwasher not draining, standing water at bottom.", priority: "MEDIUM", category: "APPLIANCE" },
    { title: "Loose Stair Railing", desc: "Stair railing is loose and unsafe.", priority: "HIGH", category: "STRUCTURAL" },
    { title: "Landscape Maintenance", desc: "Monthly lawn care and hedge trimming needed.", priority: "LOW", category: "LANDSCAPING" },
    { title: "Annual HVAC Inspection", desc: "Scheduled annual HVAC system inspection and maintenance.", priority: "LOW", category: "HVAC" },
    { title: "Electrical Outlet Not Working", desc: "Bedroom outlet has no power, may be tripped circuit.", priority: "MEDIUM", category: "ELECTRICAL" },
    { title: "Mold in Bathroom", desc: "Mold growing on bathroom ceiling, ventilation issue.", priority: "HIGH", category: "OTHER" },
    { title: "Broken Closet Door", desc: "Closet door off track, won't close properly.", priority: "LOW", category: "OTHER" },
    { title: "Water Pressure Low", desc: "Noticeably low water pressure throughout apartment.", priority: "MEDIUM", category: "PLUMBING" },
    { title: "Heating Not Working", desc: "Furnace not turning on, cold apartment.", priority: "URGENT", category: "HVAC" },
    { title: "Cracked Window Pane", desc: "Living room window has crack, needs replacement.", priority: "MEDIUM", category: "OTHER" },
    { title: "Carpet Cleaning", desc: "End of lease carpet cleaning required.", priority: "LOW", category: "CLEANING" },
    { title: "Lock Change Request", desc: "Tenant requested lock change for security.", priority: "MEDIUM", category: "SECURITY" },
    { title: "Dryer Not Heating", desc: "Dryer runs but doesn't heat up, clothes stay wet.", priority: "MEDIUM", category: "APPLIANCE" },
    { title: "Gutter Cleaning", desc: "Gutters overflowing, need seasonal cleaning.", priority: "LOW", category: "LANDSCAPING" },
  ];

  const maintenanceStatuses = ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
  
  for (let i = 0; i < 25; i++) {
    const issue = maintenanceIssues[i];
    const listing = listings[i % listings.length];
    const status = maintenanceStatuses[Math.floor(Math.random() * maintenanceStatuses.length)];
    const daysAgo = Math.floor(Math.random() * 120) + 1;
    const createdDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    
    await prisma.maintenanceRequest.create({
      data: {
        listingId: listing.id,
        userId: listing.landlordId,
        title: issue.title,
        description: issue.desc,
        priority: issue.priority,
        category: issue.category,
        status: status,
        createdAt: createdDate,
        updatedAt: status === "COMPLETED" ? new Date(createdDate.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000) : createdDate,
      },
    });
  }

  console.log("\n✅ Seeding completed successfully!");
  console.log(`
Created:
- 3 Landlords
- 20 Tenants
- 20 Listings
- 20+ Applications
- 15 Standard Leases
- 15 Custom Leases
- 40+ Payments
- 25 Maintenance Requests
  `);
}

main()
  .catch((e) => {
    console.error("Error occurred during query execution:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
