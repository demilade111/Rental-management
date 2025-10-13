import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  await prisma.$connect();
  console.log("✅ Database connected successfully");
} catch (error) {
  console.error("❌ Database connection failed:", error.message);
  process.exit(1);
}

// Gracefully disconnect Prisma when Node exits
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export { prisma };
