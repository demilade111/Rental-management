import { z } from "zod";

export const createListingSchema = z.object({
  // Property Details Section
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200),
  propertyType: z.enum(["RESIDENTIAL", "COMMERCIAL"], {
    errorMap: () => ({
      message: "Property type must be RESIDENTIAL or COMMERCIAL",
    }),
  }),
  propertyOwner: z.string().trim().min(2).max(200).optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  totalSquareFeet: z.number().int().positive().optional(),
  yearBuilt: z
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear())
    .optional(),

  // Address Section
  country: z.string().trim().min(2, "Country is required"),
  state: z.string().trim().min(2, "State is required"),
  city: z.string().trim().min(2, "City is required"),
  streetAddress: z.string().trim().min(3, "Street address is required"),
  zipCode: z.string().trim().optional(),

  // Rental Information Section
  rentCycle: z.enum(["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"], {
    errorMap: () => ({
      message: "Rent cycle must be DAILY, WEEKLY, MONTHLY, QUARTERLY, or YEARLY",
    }),
  }),
  rentAmount: z.number().positive("Rent amount must be positive"),
  securityDeposit: z.number().nonnegative().optional(),
  availableDate: z.coerce.date(),

  // Description Section
  description: z.string().trim().max(5000).optional(),

  // Contact Information Section
  contactName: z.string().trim().min(2).max(100).optional(),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^[0-9\s\-\+\(\)]+$/, "Invalid phone number format")
    .optional(),
  email: z.string().trim().email("Invalid email format").optional(),

  // Notes Section
  notes: z.string().trim().max(2000).optional(),

  // Relations
  amenities: z.array(z.string().trim().min(1)).optional(),
  images: z.array(z.string().url().trim()).optional(),
});