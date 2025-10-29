const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log("🔧 Creating test maintenance request...");

    const maintenanceRequest = await prisma.maintenanceRequest.create({
      data: {
        userId: "cmhbfifef0000138kdxl7wq3a", // Test Tenant
        listingId: "cmh6cnibx000213sp5gv4x2f6", // Existing listing
        leaseId: "cmhbfik5k0002138kj250a14u", // The lease we just created
        title: "Broken Door Handle",
        description:
          "The front door handle is loose and needs to be fixed. It is difficult to open and close the door.",
        category: "STRUCTURAL",
        priority: "MEDIUM",
        status: "OPEN",
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            state: true,
          },
        },
      },
    });

    console.log("✅ Maintenance request created successfully!");
    console.log(
      "📄 Request details:",
      JSON.stringify(maintenanceRequest, null, 2)
    );
  } catch (error) {
    console.error("❌ Error creating maintenance request:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
