import { z } from "zod";

export const updateLeaseSchema = z.object({
  endDate: z.string().optional(),
  rentAmount: z.number().optional(),
  leaseStatus: z.string().optional(),
  notes: z.string().optional(),
});
