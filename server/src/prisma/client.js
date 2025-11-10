import { PrismaClient } from "@prisma/client";

// Use DIRECT_URL for runtime connections to avoid pgbouncer issues
// Supabase pooler with pgbouncer doesn't work well with Prisma
// Add SSL parameters for Supabase connection
const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const connectionString = databaseUrl?.includes('?') 
  ? `${databaseUrl}&connection_limit=1`
  : `${databaseUrl}?connection_limit=1`;

// Create and export Prisma client instance immediately
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionString,
    },
  },
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

// Connect to the database asynchronously
prisma
  .$connect()
  .then(() => {
    console.log("✅ Database connected successfully");
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  });

// Export enums from Prisma
export { Prisma as PrismaEnums } from "@prisma/client";

// Gracefully disconnect Prisma when Node exits
const gracefulShutdown = async () => {
  try {
    await prisma.$disconnect();
    console.log("Database disconnected successfully");
  } catch (error) {
    console.error("Error disconnecting from database:", error);
  }
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
process.on("beforeExit", gracefulShutdown);

// Export prisma client
export { prisma };

// Export Prisma types and enums
export { PrismaClient, Prisma } from "@prisma/client";

// Export specific enums for convenience
export const UserRole = {
  ADMIN: "ADMIN",
  TENANT: "TENANT",
};

export const LeaseStatus = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  TERMINATED: "TERMINATED",
};

export const MaintenanceStatus = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export const MaintenancePriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
};

export const MaintenanceCategory = {
  PLUMBING: "PLUMBING",
  ELECTRICAL: "ELECTRICAL",
  HVAC: "HVAC",
  APPLIANCE: "APPLIANCE",
  STRUCTURAL: "STRUCTURAL",
  PEST_CONTROL: "PEST_CONTROL",
  CLEANING: "CLEANING",
  LANDSCAPING: "LANDSCAPING",
  SECURITY: "SECURITY",
  OTHER: "OTHER",
};

export const PropertyCategory = {
  RESIDENTIAL: "RESIDENTIAL",
  COMMERCIAL: "COMMERCIAL",
};

export const ResidentialType = {
  APARTMENT: "APARTMENT",
  CONDO: "CONDO",
  TOWNHOUSE: "TOWNHOUSE",
  MULTI_FAMILY: "MULTI_FAMILY",
  SINGLE_FAMILY: "SINGLE_FAMILY",
  STUDIO: "STUDIO",
};

export const CommercialType = {
  INDUSTRIAL: "INDUSTRIAL",
  OFFICE: "OFFICE",
  RETAIL: "RETAIL",
  SHOPPING_CENTER: "SHOPPING_CENTER",
  STORAGE: "STORAGE",
  PARKING_SPACE: "PARKING_SPACE",
  WAREHOUSE: "WAREHOUSE",
};

export const RentCycle = {
  MONTHLY: "MONTHLY",
  QUARTERLY: "QUARTERLY",
  YEARLY: "YEARLY",
};

export const ApplicationStatus = {
  NEW: "NEW",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
};
