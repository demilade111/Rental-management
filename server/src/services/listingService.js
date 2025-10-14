import { prisma } from "../prisma/client.js";
import sanitizeHtml from "sanitize-html";
import { NotFoundError, ForbiddenError } from "../utils/httpResponse.js";

const dedupe = (arr) => Array.from(new Set(arr));
const toLower = (arr) => arr.map((s) => s.toLowerCase());

async function createListings(landlordId, data) {
  const landlord = await prisma.user.findUnique({
    where: { id: landlordId },
    select: { id: true, role: true },
  });
  if (!landlord || landlord.role !== "ADMIN") {
    const err = new Error("Unauthorized: only landlords can create listings");
    err.status = 403;
    throw err;
  }

  const cleanDescription = sanitizeHtml(data.description || "", {
    allowedTags: [],
    allowedAttributes: {},
  });

  const amenities = dedupe(
    toLower((data.amenities || []).map((a) => a.trim()).filter(Boolean))
  );
  const images = dedupe(
    (data.images || []).map((u) => u.trim()).filter(Boolean)
  );

  const listing = await prisma.listing.create({
    data: {
      landlordId,
      title: data.title.trim(),
      description: cleanDescription,
      category: data.category,
      residentialType: data.residentialType || null,
      commercialType: data.commercialType || null,
      address: data.address.trim(),
      city: data.city.trim(),
      state: data.state.trim(),
      country: data.country.trim(),
      zipCode: data.zipCode || null,
      bedrooms: data.bedrooms ?? null,
      bathrooms: data.bathrooms ?? null,
      size: data.size ?? null,
      yearBuilt: data.yearBuilt ?? null,
      rentAmount: data.rentAmount,
      rentCycle: data.rentCycle,
      securityDeposit: data.securityDeposit ?? null,
      availableDate: data.availableDate,
      amenities: { create: amenities.map((name) => ({ name })) },
      images: { create: images.map((url) => ({ url })) },
    },
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

// Adding a new amenity to a listing functionality
async function addAmenityToListing(listingId, name) {
  if (!name || !name.trim()) {
    const err = new Error("Amenity name cannot be empty");
    err.status = 400;
    throw err;
  }
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    const err = new Error("Listing not found");
    err.status = 404;
    throw err;
  }
  const amenity = await prisma.amenity.create({
    data: { listingId, name: name.trim().toLowerCase() },
  });
  return amenity;
}

// Functionality to remove a specific amenity
async function removeAmenityFromListing(amenityId) {
  const amenity = await prisma.listingAmenity.findUnique({ where: { id: amenityId } });

  if (!amenity) {
    const err = new Error("Amenity not found");
    err.status = 404;
    throw err;
  }

  await prisma.listingAmenity.delete({ where: { id: amenityId } });

  return { message: "Amenity removed successfully!" };

}

export { createListings, getAllListings, getListingById, updateListingById, deleteListingById, addAmenityToListing, removeAmenityFromListing };
