import { prisma } from "../prisma/client.js";

export const updateLeaseById = async (leaseId, userId, data) => {
  // finding lease
  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
  });

  if (!lease) {
    const err = new Error("Lease not found");
    err.status = 404;
    throw err;
  }


  //verification that landlord is the owner of the lease
  if (lease.landlordId !== userId) {
    const err = new Error("Unauthorized: you cannot update this lease");
    err.status = 403;
    throw err;
  }

  // update lease record
  const updatedLease = await prisma.lease.update({
    where: { id: leaseId },
    data: {
      endDate: data.endDate ?? lease.endDate,
      rentAmount: data.rentAmount ?? lease.rentAmount,
      leaseStatus: data.leaseStatus ?? lease.leaseStatus,
      notes: data.notes ?? lease.notes,
    },
  });

  return updatedLease;
};

/*Getting all leases */
export const getAllLeases = async () => {
  const leases = await prisma.lease.findMany({
    include: {
      listing: true,
      tenant: {
      select: { id: true, firstName: true, lastName: true, email: true },
      },
      landlord: {
      select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return leases;
};

/*Getting specific lease by ID */
export const getLeaseById = async (leaseId) => {
  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    include: {
    listing: true,
    tenant: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      landlord: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  if (!lease) {
    const err = new Error("Lease not found");
    err.status = 404;
    throw err;
  }

  return lease;
};