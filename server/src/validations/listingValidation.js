import { z } from "zod";

export const createListingSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(200),
    description: z.string().trim().max(5000).optional(),
    category: z.enum(["RESIDENTIAL", "COMMERCIAL"], {
      errorMap: () => ({
        message: "Category must be RESIDENTIAL or COMMERCIAL",
      }),
    }),
    residentialType: z
      .enum([
        "APARTMENT",
        "CONDO",
        "TOWNHOUSE",
        "MULTI_FAMILY",
        "SINGLE_FAMILY",
        "STUDIO",
      ])
      .optional(),
    commercialType: z
      .enum([
        "INDUSTRIAL",
        "OFFICE",
        "RETAIL",
        "SHOPPING_CENTER",
        "STORAGE",
        "PARKING_SPACE",
        "WAREHOUSE",
      ])
      .optional(),
    address: z.string().trim().min(3, "Address is required"),
    city: z.string().trim().min(2, "City is required"),
    state: z.string().trim().min(2, "State is required"),
    country: z.string().trim().min(2, "Country is required"),
    zipCode: z.string().trim().optional(),
    bedrooms: z.number().int().nonnegative().optional(),
    bathrooms: z.number().int().nonnegative().optional(),
    size: z.number().int().positive().optional(),
    yearBuilt: z
      .number()
      .int()
      .min(1800)
      .max(new Date().getFullYear())
      .optional(),
    rentAmount: z.number().positive("Rent amount must be positive"),
    rentCycle: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"], {
      errorMap: () => ({
        message: "Rent cycle must be MONTHLY, QUARTERLY, or YEARLY",
      }),
    }),
    securityDeposit: z.number().nonnegative().optional(),
    availableDate: z.coerce.date(),
    amenities: z.array(z.string().trim().min(1)).optional(),
    images: z.array(z.string().url().trim()).optional(),
  })
  .refine(
    (data) => {
      if (data.category === "RESIDENTIAL" && !data.residentialType) {
        return false;
      }
      return true;
    },
    {
      message: "Residential type is required for residential properties",
      path: ["residentialType"],
    }
  )
  .refine(
    (data) => {
      if (data.category === "COMMERCIAL" && !data.commercialType) {
        return false;
      }
      return true;
    },
    {
      message: "Commercial type is required for commercial properties",
      path: ["commercialType"],
    }
  );
