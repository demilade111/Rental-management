import { prisma } from "../prisma/client.js";

const dedupe = (arr) => Array.from(new Set(arr));

async function createMaintenanceRequest(tenantId, data) {
  const lease = await prisma.lease.findFirst({
    where: {
      tenantId,
      listingId: data.listingId,
      leaseStatus: "ACTIVE",
    },
  });

  if (!lease) {
    const err = new Error("You do not have an active lease for this property");
    err.status = 403;
    throw err;
  }

  const images = dedupe(
    (data.images || []).map((u) => u.trim()).filter(Boolean)
  );

  const maintenanceRequest = await prisma.maintenanceRequest.create({
    data: {
      tenantId,
      listingId: data.listingId,
      leaseId: lease.id,
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
      tenant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      listing: {
        select: {
          id: true,
          title: true,
          address: true,
          city: true,
          state: true,
          landlordId: true,
        },
      },
      images: true,
    },
  });

  return maintenanceRequest;
}

async function getAllMaintenanceRequests(userId, userRole, filters = {}) {
  const { status, priority, category, listingId } = filters;

  let whereClause = {};

  if (userRole === "TENANT") {
    whereClause.tenantId = userId;
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
      tenant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      listing: {
        select: {
          id: true,
          title: true,
          address: true,
          city: true,
          state: true,
        },
      },
      // images: false,
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  return maintenanceRequests;
}

async function getMaintenanceRequestById(requestId, userId, userRole) {
  const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
    where: { id: requestId },
    include: {
      tenant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      listing: {
        select: {
          id: true,
          title: true,
          address: true,
          city: true,
          state: true,
          landlordId: true,
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
  const isTenant = maintenanceRequest.tenantId === userId;

  if (!isLandlord && !isTenant) {
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
    },
  });

  if (!existingRequest) {
    const err = new Error("Maintenance request not found");
    err.status = 404;
    throw err;
  }

  const isLandlord = existingRequest.listing.landlordId === userId;
  const isTenant = existingRequest.tenantId === userId;

  if (!isLandlord && !isTenant) {
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
      tenant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      listing: {
        select: {
          id: true,
          title: true,
          address: true,
          city: true,
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
    },
  });

  if (!existingRequest) {
    const err = new Error("Maintenance request not found");
    err.status = 404;
    throw err;
  }

  const isLandlord = existingRequest.listing.landlordId === userId;
  const isTenant = existingRequest.tenantId === userId;

  if (!isLandlord && !isTenant) {
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
