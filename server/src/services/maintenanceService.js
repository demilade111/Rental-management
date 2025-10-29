import { prisma } from "../prisma/client.js";

const dedupe = (arr) => Array.from(new Set(arr));

async function createMaintenanceRequest(userId, userRole, data) {
  console.log("Creating maintenance request with data:", data);
  const listing = await prisma.listing.findUnique({
    where: { id: data.listingId },
  });
  console.log("Listing found:", listing);
  if (!listing) {
    const err = new Error("Listing not found");
    err.status = 404;
    throw err;
  }

  let leaseId = null;

  if (userRole === "TENANT") {
    const lease = await prisma.lease.findFirst({
      where: {
        tenantId: userId,
        listingId: data.listingId,
        leaseStatus: "ACTIVE",
      },
    });

    if (!lease) {
      const err = new Error(
        "You do not have an active lease for this property"
      );
      err.status = 403;
      throw err;
    }

    leaseId = lease.id;
  } else if (userRole === "ADMIN") {
    console.log("User is ADMIN, verifying ownership of listing");
    console.log("  Listing landlordId:", listing.landlordId);
    console.log("  Current userId:", userId);
    console.log("  Types:", typeof listing.landlordId, typeof userId);
    console.log("  Match:", listing.landlordId === userId);

    if (listing.landlordId !== userId) {
      console.error("❌ OWNERSHIP MISMATCH!");
      const err = new Error("You do not own this property");
      err.status = 403;
      throw err;
    }
    console.log("✅ Ownership verified");
    const activeLease = await prisma.lease.findFirst({
      where: {
        listingId: data.listingId,
        leaseStatus: "ACTIVE",
      },
    });

    if (activeLease) {
      leaseId = activeLease.id;
    }
  } else {
    const err = new Error("Unauthorized to create maintenance request");
    err.status = 403;
    throw err;
  }

  const images = dedupe(
    (data.images || []).map((u) => u.trim()).filter(Boolean)
  );

  const maintenanceRequest = await prisma.maintenanceRequest.create({
    data: {
      user: { connect: { id: userId } },
      listing: { connect: { id: data.listingId } },
      lease: leaseId ? { connect: { id: leaseId } } : undefined,
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category,
      priority: data.priority || "MEDIUM",
      images:
        images.length > 0
          ? { create: images.map((url) => ({ url })) }
          : undefined,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
        },
      },
      listing: {
        select: {
          id: true,
          title: true,
          streetAddress: true,
          city: true,
          state: true,
          landlordId: true,
        },
      },
      images: true,
      ...(leaseId && {
        lease: {
          include: {
            tenant: true,
          },
        },
      }),
    },
  });

  return maintenanceRequest;
}

async function getAllMaintenanceRequests(userId, userRole, filters = {}) {
  const { status, priority, category, listingId } = filters;

  let whereClause = {};

  if (userRole === "TENANT") {
    whereClause.userId = userId;
  } else if (userRole === "ADMIN") {
    whereClause.listing = {
      landlordId: userId,
    };
  }

  if (status) whereClause.status = status;
  if (priority) whereClause.priority = priority;
  if (category) whereClause.category = category;
  if (listingId) whereClause.listingId = listingId;

  const maintenanceRequests = await prisma.maintenanceRequest.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
        },
      },
      listing: {
        select: {
          id: true,
          title: true,
          streetAddress: true,
          city: true,
          state: true,
        },
      },
      lease: {
        select: {
          id: true,
          tenantId: true,
        },
      },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  return maintenanceRequests;
}

async function getMaintenanceRequestById(requestId, userId, userRole) {
  const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
    where: { id: requestId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
        },
      },
      listing: {
        select: {
          id: true,
          title: true,
          streetAddress: true,
          city: true,
          state: true,
          landlordId: true,
        },
      },
      lease: {
        select: {
          id: true,
          tenantId: true,
        },
      },
      images: true,
    },
  });

  if (!maintenanceRequest) {
    const err = new Error("Maintenance request not found");
    err.status = 404;
    throw err;
  }

  const isLandlord = maintenanceRequest.listing.landlordId === userId;
  const isCreator = maintenanceRequest.userId === userId;
  const isTenantOfLease = maintenanceRequest.lease?.tenantId === userId;

  if (!isLandlord && !isCreator && !isTenantOfLease) {
    const err = new Error("Unauthorized to view this maintenance request");
    err.status = 403;
    throw err;
  }

  return maintenanceRequest;
}

async function updateMaintenanceRequest(requestId, userId, userRole, updates) {
  const existingRequest = await prisma.maintenanceRequest.findUnique({
    where: { id: requestId },
    include: {
      listing: true,
      lease: true,
    },
  });

  if (!existingRequest) {
    const err = new Error("Maintenance request not found");
    err.status = 404;
    throw err;
  }

  const isLandlord = existingRequest.listing.landlordId === userId;
  const isCreator = existingRequest.userId === userId;
  const isTenantOfLease = existingRequest.lease?.tenantId === userId;

  if (!isLandlord && !isCreator && !isTenantOfLease) {
    const err = new Error("Unauthorized to update this maintenance request");
    err.status = 403;
    throw err;
  }

  let allowedUpdates = {};

  if (userRole === "TENANT") {
    if (updates.description) allowedUpdates.description = updates.description;
    if (updates.priority) allowedUpdates.priority = updates.priority;
  } else if (userRole === "ADMIN") {
    if (updates.status) allowedUpdates.status = updates.status;
    if (updates.priority) allowedUpdates.priority = updates.priority;
    if (updates.description) allowedUpdates.description = updates.description;
  }

  const updatedRequest = await prisma.maintenanceRequest.update({
    where: { id: requestId },
    data: allowedUpdates,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      listing: {
        select: {
          id: true,
          title: true,
          streetAddress: true,
          city: true,
        },
      },
      lease: {
        select: {
          id: true,
          tenantId: true,
        },
      },
      images: true,
    },
  });

  return updatedRequest;
}

async function deleteMaintenanceRequest(requestId, userId, userRole) {
  const existingRequest = await prisma.maintenanceRequest.findUnique({
    where: { id: requestId },
    include: {
      listing: true,
      lease: true,
    },
  });

  if (!existingRequest) {
    const err = new Error("Maintenance request not found");
    err.status = 404;
    throw err;
  }

  const isLandlord = existingRequest.listing.landlordId === userId;
  const isCreator = existingRequest.userId === userId;

  if (!isLandlord && !isCreator) {
    const err = new Error("Unauthorized to delete this maintenance request");
    err.status = 403;
    throw err;
  }

  if (
    existingRequest.status !== "OPEN" &&
    existingRequest.status !== "CANCELLED"
  ) {
    const err = new Error(
      "Cannot delete maintenance request in current status"
    );
    err.status = 400;
    throw err;
  }

  await prisma.maintenanceRequest.delete({
    where: { id: requestId },
  });

  return { message: "Maintenance request deleted successfully" };
}

export {
  createMaintenanceRequest,
  getAllMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
};
