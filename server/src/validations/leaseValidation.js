import { z } from "zod";

export const updateLeaseSchema = z.object({
  endDate: z.string().optional(),
  rentAmount: z.number().optional(),
  leaseStatus: z.string().optional(),
  notes: z.string().optional(),
});
export const createLeaseSchema = z.object({
  listingId: z.string().min(1),
  tenantId: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  rentAmount: z.number().positive(),
  paymentFrequency: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]),
  paymentMethod: z.string().optional(),
  leaseStatus: z.enum(["DRAFT", "ACTIVE", "EXPIRED", "TERMINATED"]).optional(),
  notes: z.string().optional(),
});