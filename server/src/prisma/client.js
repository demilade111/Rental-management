import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

// test database connection
prisma
  .$connect()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  });

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});
