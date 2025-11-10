import { prisma } from "../prisma/client.js";

export const createLease = async (landlordId, data) => {
  const listing = await prisma.listing.findUnique({
    where: { id: data.listingId },
    include: { landlord: true },
  });

  if (!listing) {
    const err = new Error("Listing not found");
    err.status = 404;
    throw err;
  }

  if (listing.landlordId !== landlordId) {
    const err = new Error("Unauthorized: You do not own this property");
    err.status = 403;
    throw err;
  }

  const tenant = await prisma.user.findUnique({
    where: { id: data.tenantId },
  });

  if (!tenant) {
    const err = new Error("Tenant not found");
    err.status = 404;
    throw err;
  }

  const lease = await prisma.lease.create({
    data: {
      listingId: data.listingId,
      tenantId: data.tenantId,
      landlordId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      rentAmount: data.rentAmount,
      paymentFrequency: data.paymentFrequency,
      securityDeposit: data.securityDeposit,
      paymentMethod: data.paymentMethod,
      leaseStatus: data.leaseStatus || "ACTIVE",
      leaseDocument: data.leaseDocument,
      signedContract: data.signedContract,
      notes: data.notes,
    },
    include: {
      users_Lease_tenantIdTousers: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      users_Lease_landlordIdTousers: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      Listing: {
        select: {
          id: true,
          title: true,
          streetAddress: true,
          city: true,
          state: true,
          country: true,
        },
      },
    },
  });

  return lease;
};

export const getAllLeases = async (userId, userRole, filters = {}) => {
  try {
    console.log("🟢 getAllLeases() called with:", {
      userId,
      userRole,
      filters,
    });

    const where = {};

    if (userRole === "LANDLORD") {
      where.landlordId = userId;
    } else if (userRole === "TENANT") {
      where.tenantId = userId;
    }

    if (filters.leaseStatus) {
      where.leaseStatus = filters.leaseStatus;
    }
    if (filters.listingId) {
      where.listingId = filters.listingId;
    }

    console.log("📘 Prisma Query WHERE:", where);

    const leases = await prisma.lease.findMany({
      where,
      include: {
        users_Lease_tenantIdTousers: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        Listing: {
          select: {
            id: true,
            title: true,
            streetAddress: true,
            city: true,
            state: true,
            country: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });

    console.log("✅ Query successful, found leases:", leases.length);
    return leases;
  } catch (error) {
    console.error("🔥 Prisma error in getAllLeases():", error);
    throw new Error("Internal server error from leaseService");
  }
};

export const getLeaseById = async (leaseId, userId, userRole) => {
  try {
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        users_Lease_tenantIdTousers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        users_Lease_landlordIdTousers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        Listing: {
          select: {
            id: true,
            title: true,
            streetAddress: true,
            city: true,
            state: true,
            country: true,
            zipCode: true,
          },
        },
        maintenanceRequests: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!lease) {
      const err = new Error("Lease not found");
      err.status = 404;
      throw err;
    }

    if (userRole === "LANDLORD" && lease.landlordId !== userId) {
      const err = new Error("Unauthorized: You do not have access to this lease");
      err.status = 403;
      throw err;
    }

    if (userRole === "TENANT" && lease.tenantId !== userId) {
      const err = new Error("Unauthorized: You do not have access to this lease");
      err.status = 403;
      throw err;
    }

    return lease;
  } catch (error) {
    // If it's already our custom error, rethrow it
    if (error.status) {
      throw error;
    }
    // For invalid UUIDs or other Prisma errors, return 404
    console.error("Database error in getLeaseById:", error);
    const err = new Error("Lease not found");
    err.status = 404;
    throw err;
  }
};

export const updateLeaseById = async (leaseId, userId, data) => {
  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
  });

  if (!lease) {
    const err = new Error("Lease not found");
    err.status = 404;
    throw err;
  }

  if (lease.landlordId !== userId) {
    const err = new Error("Unauthorized: you cannot update this lease");
    err.status = 403;
    throw err;
  }

  const updatedLease = await prisma.lease.update({
    where: { id: leaseId },
    data: {
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      rentAmount: data.rentAmount,
      paymentFrequency: data.paymentFrequency,
      securityDeposit: data.securityDeposit,
      paymentMethod: data.paymentMethod,
      leaseStatus: data.leaseStatus,
      leaseDocument: data.leaseDocument,
      signedContract: data.signedContract,
      notes: data.notes,
    },
    include: {
      users_Lease_tenantIdTousers: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      users_Lease_landlordIdTousers: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      Listing: {
        select: {
          id: true,
          title: true,
          streetAddress: true,
          city: true,
          state: true,
          country: true,
        },
      },
    },
  });

  return updatedLease;
};

export const deleteLeaseById = async (leaseId, userId) => {
  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
  });

  if (!lease) {
    const err = new Error("Lease not found");
    err.status = 404;
    throw err;
  }

  if (lease.landlordId !== userId) {
    const err = new Error("Unauthorized: you cannot delete this lease");
    err.status = 403;
    throw err;
  }

  if (lease.leaseStatus === "ACTIVE") {
    const err = new Error(
      "Cannot delete an active lease. Please terminate it first."
    );
    err.status = 400;
    throw err;
  }

  await prisma.lease.delete({
    where: { id: leaseId },
  });

  return { message: "Lease deleted successfully" };
};
