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

async function updateListingById(id, userId, updates) {
  const listing = await prisma.listing.findUnique({ where: { id } });

  if (!listing) throw new NotFoundError("Listing not found");

  if (listing.landlordId !== userId)
    throw new ForbiddenError("You are not authorized to update this listing");

  const updatedListing = await prisma.listing.update({
    where: { id },
    data: updates,
  });

  return updatedListing;
}

export { createListings, getAllListings, getListingById, updateListingById };
