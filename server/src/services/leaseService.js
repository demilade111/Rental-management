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
      paymentMethod: data.paymentMethod,
      leaseStatus: data.leaseStatus || "DRAFT",
      leaseDocument: data.leaseDocument || null,
      notes: data.notes || null,
      propertyCategory: listing.category,
      residentialType: listing.residentialType,
      commercialType: listing.commercialType,
      propertyAddress: listing.address,
      propertyCity: listing.city,
      propertyState: listing.state,
      propertyCountry: listing.country,
      propertyZipCode: listing.zipCode,
      leaseTermType: data.leaseTermType,
      paymentDay: data.paymentDay,
      acceptsCash: data.acceptsCash ?? false,
      acceptsCheque: data.acceptsCheque ?? false,
      acceptsDirectDebit: data.acceptsDirectDebit ?? false,
      acceptsETransfer: data.acceptsETransfer ?? false,
      acceptsOther: data.acceptsOther ?? false,
      customPaymentInfo: data.customPaymentInfo,
      rentIncreaseNoticeType: data.rentIncreaseNoticeType,
      customRentIncreaseNoticeDays: data.customRentIncreaseNoticeDays,
      hasSecurityDeposit: data.hasSecurityDeposit ?? false,
      discloseBankInfo: data.discloseBankInfo ?? false,
      depositAmount: data.depositAmount,
      depositBankName: data.depositBankName,
      depositAccountInfo: data.depositAccountInfo,
      depositReturnNoticeType: data.depositReturnNoticeType,
      customDepositNoticeDays: data.customDepositNoticeDays,
      landlordType: data.landlordType,
      landlordFullName: data.landlordFullName,
      landlordEmail: data.landlordEmail,
      landlordPhone: data.landlordPhone,
      landlordAddress: data.landlordAddress,
      additionalLandlords: data.additionalLandlords || undefined,
      tenantFullName: data.tenantFullName,
      tenantEmail: data.tenantEmail,
      tenantPhone: data.tenantPhone,
      additionalTenants: data.additionalTenants || undefined,
      allowsOccupants: data.allowsOccupants ?? false,
      occupants: data.occupants || undefined,
      numberOfOccupants: data.numberOfOccupants,
    },
    include: {
      tenant: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      listing: {
        select: {
          id: true,
          title: true,
          address: true,
          city: true,
          state: true,
          country: true,
        },
      },
    },
  });

  return lease;
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
