import { prisma } from "../prisma/client.js";
import sanitizeHtml from "sanitize-html";
import { NotFoundError, ForbiddenError } from "../utils/httpResponse.js";

const dedupe = (arr) => Array.from(new Set(arr));
const toLower = (arr) => arr.map((s) => s.toLowerCase());

async function createListings(landlordId, data) {
  const landlord = await prisma.users.findUnique({
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
    toLower((data.amenities || []).map((name) => name.trim()).filter(Boolean))
  );


  const images = dedupe(
    (data.images || [])
      .map((url) => (typeof url === 'string' ? url.trim() : null))
      .filter(Boolean)
  );

  const listing = await prisma.Listing.create({
    data: {
      landlordId,
      title: data.title.trim(),
      propertyType: data.propertyType,
      propertyOwner: data.propertyOwner?.trim() || null,
      bedrooms: data.bedrooms ?? null,
      bathrooms: data.bathrooms ?? null,
      totalSquareFeet: data.totalSquareFeet ?? null,
      yearBuilt: data.yearBuilt ?? null,
      country: data.country.trim(),
      state: data.state.trim(),
      city: data.city.trim(),
      streetAddress: data.streetAddress.trim(),
      zipCode: data.zipCode?.trim() || null,
      rentCycle: data.rentCycle,
      rentAmount: data.rentAmount,
      securityDeposit: data.securityDeposit ?? null,
      petDeposit: data.petDeposit ?? null,
      availableDate: new Date(data.availableDate),
      description: cleanDescription || null,
      contactName: data.contactName?.trim() || null,
      phoneNumber: data.phoneNumber?.trim() || null,
      email: data.email?.trim() || null,
      notes: data.notes?.trim() || null,
      amenities: {
        create: amenities.map((name) => ({ name }))
      },
      images: {
        create: images.map((url, index) => ({
          url,
          isPrimary: index === 0
        }))
      },
    },
    include: {
      ListingAmenity: true,
      ListingImage: true,
    }
  });

  return listing;
}

// async function getAllListings(landlordId) {
//   const listings = await prisma.Listing.findMany({
//     where: { landlordId },
//     include: {
//       ListingAmenity: true,
//       ListingImage: true,
//       users: {
//         select: { id: true, firstName: true, lastName: true, email: true },
//       },
//     },
//     orderBy: { createdAt: "desc" },
//   });
//   return listings;
// }

async function getAllListings(userId, userRole) {
  // TENANT: return the listing(s) from active lease (standard or custom)
  if (userRole === "TENANT") {
    const activeLease = await prisma.Lease.findFirst({
      where: {
        tenantId: userId,
        leaseStatus: "ACTIVE",
      },
      include: {
        Listing: {
          include: {
            ListingAmenity: true,
            ListingImage: true,
            users: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });

    const activeCustomLease = await prisma.CustomLease.findFirst({
      where: {
        tenantId: userId,
        leaseStatus: "ACTIVE",
      },
      include: {
        Listing: {
          include: {
            ListingAmenity: true,
            ListingImage: true,
            users: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });

    const listings = [];
    if (activeLease?.listing) listings.push(activeLease.listing);
    if (activeCustomLease?.listing) listings.push(activeCustomLease.listing);

    return listings;
  }

  // ADMIN: return all listings owned
  if (userRole === "ADMIN") {
    return prisma.Listing.findMany({
      where: { landlordId: userId },
      include: {
        ListingAmenity: true,
        ListingImage: true,
        users: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return [];
}


async function getListingById(listingId) {
  const listing = await prisma.Listing.findUnique({
    where: { id: listingId },
    include: {
      ListingAmenity: true,
      ListingImage: true,
      users: {
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
  const listing = await prisma.Listing.findUnique({
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

  await prisma.Listing.delete({ where: { id: listingId } });
  return { message: "Listing deleted successfully" };
}

async function updateListingById(id, userId, updates) {
  const listing = await prisma.Listing.findUnique({ where: { id } });

  if (!listing) throw new NotFoundError("Listing not found");

  if (listing.landlordId !== userId) {
    throw new ForbiddenError("You are not authorized to update this listing");
  }

  const updatedListing = await prisma.Listing.update({
    where: { id },
    data: updates,
  });

  return updatedListing;
}

async function checkListingHasLeases(listingId) {

  const listing = await prisma.Listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      leases: true,
      customLeases: true,
    },
  });

  console.log("this is an id " + JSON.stringify(listing.customLeases.length))

  if (!listing) throw new Error("Listing not found");

  const totalLeases = listing.leases.length + listing.customLeases.length;
  const hasLease = totalLeases > 0;

  return { listingId: listing.id, hasLease, leaseCount: listing.leases.length };
}

export { createListings, getAllListings, getListingById, updateListingById, deleteListingById, checkListingHasLeases };
