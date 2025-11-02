import { z } from "zod";

export const createCustomLeaseSchema = z.object({
    leaseName: z.string().min(1),
    propertyCategory: z.string(),
    propertyType: z.string(),
    description: z.string().optional(),
    fileUrl: z.string().url(),
    tenantId: z.string().optional(),
    listingId: z.string().optional(),
});

export const updateCustomLeaseSchema = z.object({
    leaseName: z.string().min(1).optional(),
    propertyCategory: z.string().optional(),
    propertyType: z.string().optional(),
    description: z.string().optional(),
    fileUrl: z.string().url().optional(),
    tenantId: z.string().nullable().optional(),
    listingId: z.string().optional(),
    leaseStatus: z.string().optional(),
});
