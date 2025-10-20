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
