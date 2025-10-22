import { prisma } from "../prisma/client.js";
import sanitizeHtml from "sanitize-html";
import { NotFoundError, ForbiddenError } from "../utils/httpResponse.js";

const dedupe = (arr) => Array.from(new Set(arr));
const toLower = (arr) => arr.map((s) => s.toLowerCase());

async function createListings(landlordId, data) {
  // Verify landlord exists and has correct role
  const landlord = await prisma.user.findUnique({
    where: { id: landlordId },
    select: { id: true, role: true },
  });
  
  if (!landlord || landlord.role !== "ADMIN") {
    const err = new Error("Unauthorized: only landlords can create listings");
    err.status = 403;
    throw err;
  }

  // Sanitize description
  const cleanDescription = sanitizeHtml(data.description || "", {
    allowedTags: [],
    allowedAttributes: {},
  });

  // Dedupe and clean amenities (now simple strings)
  const amenities = dedupe(
    toLower((data.amenities || []).map((name) => name.trim()).filter(Boolean))
  );
  
  // Dedupe and clean images (now simple URL strings)
  const images = dedupe(
    (data.images || [])
      .map((url) => (typeof url === 'string' ? url.trim() : null))
      .filter(Boolean)
  );

  // Create listing with nested relations
  const listing = await prisma.listing.create({
    data: {
      landlordId,
      
      // Property Details
      title: data.title.trim(),
      propertyType: data.propertyType,
      propertyOwner: data.propertyOwner?.trim() || null,
      bedrooms: data.bedrooms ?? null,
      bathrooms: data.bathrooms ?? null,
      totalSquareFeet: data.totalSquareFeet ?? null,
      yearBuilt: data.yearBuilt ?? null,
      
      // Address
      country: data.country.trim(),
      state: data.state.trim(),
      city: data.city.trim(),
      streetAddress: data.streetAddress.trim(),
      zipCode: data.zipCode?.trim() || null,
      
      // Rental Information
      rentCycle: data.rentCycle,
      rentAmount: data.rentAmount,
      securityDeposit: data.securityDeposit ?? null,
      availableDate: new Date(data.availableDate),
      
      // Description
      description: cleanDescription || null,
      
      // Contact Information
      contactName: data.contactName?.trim() || null,
      phoneNumber: data.phoneNumber?.trim() || null,
      email: data.email?.trim() || null,
      
      // Notes
      notes: data.notes?.trim() || null,
      
      // Nested relations - amenities as simple strings
      amenities: { 
        create: amenities.map((name) => ({ name })) 
      },
      // Images as simple URLs - first one is primary
      images: { 
        create: images.map((url, index) => ({
          url,
          isPrimary: index === 0
        }))
      },
    },
    include: {
      amenities: true,
      images: true,
    }
  });

  return listing;
}

async function getAllListings() {
  const listings = await prisma.listing.findMany({
    include: {
      amenities: true,
      images: true,
      landlord: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return listings;
}

async function getListingById(listingId) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      amenities: true,
      images: true,
      landlord: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  if (!listing) {
    const err = new Error("Listing not found");
    err.status = 404;
    throw err;
  }

  return listing;
}

async function deleteListingById(listingId, landlordId) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, landlordId: true },
  });

  if (!listing) {
    const err = new Error("Listing not found");
    err.status = 404;
    throw err;
  }

  if (listing.landlordId !== landlordId) {
    const err = new Error("Unauthorized: cannot delete this listing");
    err.status = 403;
    throw err;
  }

  await prisma.listing.delete({ where: { id: listingId } });
  return { message: "Listing deleted successfully" };
}

async function updateListingById(id, userId, updates) {
  const listing = await prisma.listing.findUnique({ where: { id } });

  if (!listing) throw new NotFoundError("Listing not found");

  if (listing.landlordId !== userId) {
    throw new ForbiddenError("You are not authorized to update this listing");
  }

  const updatedListing = await prisma.listing.update({
    where: { id },
    data: updates,
  });

  return updatedListing;
}

export { createListings, getAllListings, getListingById, updateListingById, deleteListingById };
