import { prisma } from "../prisma/client.js";

const dedupe = (arr) => Array.from(new Set(arr));

async function getTenantActiveListing(tenantId) {
  const lease = await prisma.lease.findFirst({
    where: {
      tenantId,
      leaseStatus: "ACTIVE"
    },
    select: {
      listingId: true,
    },
  });

  return lease?.listingId || null;
}

async function createMaintenanceRequest(userId, userRole, data) {
  let leaseId = null;
  let customLeaseId = null;
  let listingId = data.listingId; // fallback

  // TENANT → get listingId from active lease (standard or custom)
  if (userRole === "TENANT") {
    const lease = await prisma.lease.findFirst({
      where: { tenantId: userId, leaseStatus: "ACTIVE" },
    });

    if (lease) {
      leaseId = lease.id;
      listingId = lease.listingId;
    } else {
      const customLease = await prisma.customLease.findFirst({
        where: { tenantId: userId, leaseStatus: "ACTIVE" },
      });

      if (!customLease) {
        const err = new Error("No active lease found for this tenant");
        err.status = 403;
        throw err;
      }

      customLeaseId = customLease.id;
      listingId = customLease.listingId;
    }
  }

  // ADMIN → check ownership
  if (userRole === "ADMIN") {
    if (!listingId) {
      const err = new Error("listingId is required");
      err.status = 400;
      throw err;
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing || listing.landlordId !== userId) {
      const err = new Error("You do not own this property");
      err.status = 403;
      throw err;
    }

    const activeLease = await prisma.lease.findFirst({
      where: { listingId, leaseStatus: "ACTIVE" },
    });

    if (activeLease) leaseId = activeLease.id;
  }

  if (!listingId) {
    const err = new Error("listingId could not be determined");
    err.status = 400;
    throw err;
  }

  // Process images
  const images = dedupe((data.images || []).map((u) => u.trim()).filter(Boolean));

  // Create maintenance request
  const maintenanceRequest = await prisma.maintenanceRequest.create({
    data: {
      user: { connect: { id: userId } },
      listing: { connect: { id: listingId } },
      lease: leaseId ? { connect: { id: leaseId } } : undefined,
      customLease: customLeaseId ? { connect: { id: customLeaseId } } : undefined,
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category,
      priority: data.priority || "MEDIUM",
      images:
        images.length > 0 ? { create: images.map((url) => ({ url })) } : undefined,
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
      listing: { select: { id: true, title: true, streetAddress: true, city: true, state: true } },
      images: true,
      ...(leaseId && { lease: { include: { tenant: true } } }),
      ...(customLeaseId && { customLease: true }),
    },
  });

  return maintenanceRequest;
}

async function getAllMaintenanceRequests(userId, userRole, filters = {}) {
  const { status, priority, category, listingId } = filters;

  let whereClause = {};

  if (userRole === "TENANT") {
    // whereClause.userId = userId;
    const activeLease = await prisma.lease.findFirst({
      where: {
        tenantId: userId,
        leaseStatus: "ACTIVE",
      },
      select: { listingId: true },
    });

    const activeCustomLease = await prisma.customLease.findFirst({
      where: {
        tenantId: userId,
        leaseStatus: "ACTIVE",
      },
      select: { listingId: true },
    });

    const tenantListingId =
      activeLease?.listingId || activeCustomLease?.listingId;

    if (!tenantListingId) {
      return []; // tenant has no active lease, nothing to show
    }

    whereClause.listingId = tenantListingId;

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
      images: true,
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
      customLease: true,
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
  const isTenantOfCustomLease = existingRequest.customLease?.tenantId === userId;

  // Fallback: tenant has an active (standard/custom) lease on this listing even if the request doesn't store lease linkage
  let isTenantOfListingActiveLease = false;
  if (userRole === "TENANT" && !isTenantOfLease && !isTenantOfCustomLease) {
    const [activeLease, activeCustomLease] = await Promise.all([
      prisma.lease.findFirst({
        where: { listingId: existingRequest.listingId, tenantId: userId, leaseStatus: "ACTIVE" },
        select: { id: true },
      }),
      prisma.customLease.findFirst({
        where: { listingId: existingRequest.listingId, tenantId: userId, leaseStatus: "ACTIVE" },
        select: { id: true },
      }),
    ]);
    isTenantOfListingActiveLease = Boolean(activeLease || activeCustomLease);
  }

  if (!isLandlord && !isCreator && !isTenantOfLease && !isTenantOfCustomLease && !isTenantOfListingActiveLease) {
    const err = new Error("Unauthorized to update this maintenance request");
    err.status = 403;
    throw err;
  }

  let allowedUpdates = {};

  // if (userRole === "TENANT") {
  //   if (updates.description) allowedUpdates.description = updates.description;
  //   if (updates.priority) allowedUpdates.priority = updates.priority;
  // } else if (userRole === "ADMIN") {
  //   if (updates.status) allowedUpdates.status = updates.status;
  //   if (updates.priority) allowedUpdates.priority = updates.priority;
  //   if (updates.description) allowedUpdates.description = updates.description;
  // }

  // suppose to allow updating for both roles (ADMIN and TENANT)
  if (updates.status) allowedUpdates.status = updates.status;
  if (updates.priority) allowedUpdates.priority = updates.priority;
  if (updates.description) allowedUpdates.description = updates.description;

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

async function getMaintenanceMessages(requestId, userId, userRole) {
  const req = await prisma.maintenanceRequest.findUnique({
    where: { id: requestId },
    include: { listing: true, lease: true, customLease: true },
  });
  if (!req) {
    const err = new Error("Maintenance request not found");
    err.status = 404;
    throw err;
  }
  const isLandlord = req.listing.landlordId === userId;
  const isCreator = req.userId === userId;
  const isTenant = req.lease?.tenantId === userId || req.customLease?.tenantId === userId;
  if (!isLandlord && !isCreator && !isTenant) {
    const err = new Error("Unauthorized to view messages");
    err.status = 403;
    throw err;
  }
  const messages = await prisma.maintenanceMessage.findMany({
    where: { maintenanceRequestId: requestId },
    include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } },
    orderBy: { createdAt: "asc" },
  });
  return messages;
}

async function addMaintenanceMessage(requestId, userId, userRole, body) {
  if (!body || !body.trim()) {
    const err = new Error("Message body is required");
    err.status = 400;
    throw err;
  }
  const req = await prisma.maintenanceRequest.findUnique({
    where: { id: requestId },
    include: { listing: true, lease: true, customLease: true },
  });
  console.log(req);
  if (!req) {
    const err = new Error("Maintenance request not found");
    err.status = 404;
    throw err;
  }
  const isLandlord = req.listing.landlordId === userId;
  const isTenant = req.lease?.tenantId === userId || req.customLease?.tenantId === userId;
  if (!isLandlord && !isTenant) {
    const err = new Error("Unauthorized to add message");
    err.status = 403;
    throw err;
  }
  const message = await prisma.maintenanceMessage.create({
    data: {
      maintenanceRequestId: requestId,
      senderId: userId,
      body: body.trim(),
    },
    include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } },
  });
  return message;
}
export {
  createMaintenanceRequest,
  getAllMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
  getMaintenanceMessages,
  addMaintenanceMessage,
};
