import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Create a new invoice for a maintenance request
 * Automatically creates a MAINTENANCE payment when invoice is created
 */
export const createInvoice = async (data, userId, userRole) => {
  const { maintenanceRequestId, description, amount, sharedWithTenant = true } = data;

  // Verify maintenance request exists and user has access
  const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
    where: { id: maintenanceRequestId },
    include: {
      listing: {
        include: {
          leases: {
            where: { leaseStatus: "ACTIVE" },
            include: { tenant: true },
          },
          customLeases: {
            where: { leaseStatus: "ACTIVE" },
            include: { tenant: true },
          },
        },
      },
      user: true,
    },
  });

  if (!maintenanceRequest) {
    throw new Error("Maintenance request not found");
  }

  // Check authorization - only landlord of the property can create invoice
  if (userRole !== "ADMIN" && maintenanceRequest.listing.landlordId !== userId) {
    throw new Error("Unauthorized to create invoice for this maintenance request");
  }

  // Get tenant from active lease (standard or custom)
  const activeLease = maintenanceRequest.listing.leases[0] || maintenanceRequest.listing.customLeases[0];
  const tenantId = activeLease?.tenantId || maintenanceRequest.userId;
  const leaseId = maintenanceRequest.listing.leases[0]?.id || null;
  const customLeaseId = maintenanceRequest.listing.customLeases[0]?.id || null;

  // Use transaction to create invoice and payment together
  const result = await prisma.$transaction(async (tx) => {
    // Create payment first
    const payment = await tx.payment.create({
      data: {
        type: "MAINTENANCE",
        amount: parseFloat(amount),
        status: "PENDING",
        dueDate: new Date(), // Due immediately
        landlordId: maintenanceRequest.listing.landlordId,
        tenantId: tenantId,
        leaseId: leaseId,
        customLeaseId: customLeaseId,
        notes: description,
      },
    });

    // Create invoice linked to payment
    const invoice = await tx.invoice.create({
      data: {
        maintenanceRequestId,
        description,
        amount: parseFloat(amount),
        status: "PENDING",
        sharedWithTenant: Boolean(sharedWithTenant),
        paymentId: payment.id,
      },
      include: {
        maintenanceRequest: {
          include: {
            listing: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        payment: true,
      },
    });

    return invoice;
  });

  // Debug logging
  console.log(`\n🧾 INVOICE CREATED:`);
  console.log(`  Invoice ID: ${result.id}`);
  console.log(`  Payment ID: ${result.paymentId}`);
  console.log(`  Tenant ID: ${tenantId}`);
  console.log(`  Amount: $${amount}`);
  console.log(`  sharedWithTenant: ${result.sharedWithTenant}`);
  if (!result.sharedWithTenant) {
    console.log(`   🔒 This invoice is NOT shared - payment will be HIDDEN from tenant`);
  } else {
    console.log(`   ✅ This invoice IS shared - payment will be VISIBLE to tenant`);
  }

  return result;
};

/**
 * Get all invoices for a maintenance request
 */
export const getInvoicesByMaintenanceRequest = async (maintenanceRequestId, userId, userRole) => {
  // Verify maintenance request exists and user has access
  const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
    where: { id: maintenanceRequestId },
    include: {
      listing: true,
    },
  });

  if (!maintenanceRequest) {
    throw new Error("Maintenance request not found");
  }

  // Check authorization
  const isLandlord = maintenanceRequest.listing.landlordId === userId;
  
  // For tenants, check if they have an active lease for this listing
  let isTenantWithActiveLease = false;
  if (userRole === "TENANT") {
    const activeLease = await prisma.lease.findFirst({
      where: {
        listingId: maintenanceRequest.listingId,
        tenantId: userId,
        leaseStatus: "ACTIVE",
      },
    });
    
    const activeCustomLease = await prisma.customLease.findFirst({
      where: {
        listingId: maintenanceRequest.listingId,
        tenantId: userId,
        leaseStatus: "ACTIVE",
      },
    });
    
    isTenantWithActiveLease = !!(activeLease || activeCustomLease);
  }
  
  if (userRole !== "ADMIN" && !isLandlord && !isTenantWithActiveLease) {
    throw new Error("Unauthorized to view invoices for this maintenance request");
  }

  // Build where clause - tenants only see shared invoices
  const where = {
    maintenanceRequestId,
  };
  
  if (userRole === "TENANT") {
    where.sharedWithTenant = true;
  }

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      maintenanceRequest: {
        include: {
          listing: true,
        },
      },
      payment: true,
    },
  });

  // Debug logging
  console.log(`\n📋 GET INVOICES BY MAINTENANCE REQUEST:`);
  console.log(`  Maintenance ID: ${maintenanceRequestId}`);
  console.log(`  User ID: ${userId}`);
  console.log(`  User Role: ${userRole}`);
  console.log(`  Is Landlord: ${isLandlord}`);
  console.log(`  Is Tenant with Active Lease: ${isTenantWithActiveLease}`);
  console.log(`  Where clause:`, JSON.stringify(where));
  console.log(`  Found ${invoices.length} invoices`);
  invoices.forEach((inv, idx) => {
    console.log(`    [${idx}] Amount: $${inv.amount}, Shared: ${inv.sharedWithTenant}`);
  });

  return invoices;
};

/**
 * Get invoice by ID
 */
export const getInvoiceById = async (invoiceId, userId, userRole) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      maintenanceRequest: {
        include: {
          listing: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  // Check authorization
  const isTenant = invoice.maintenanceRequest.userId === userId;
  const isLandlord = invoice.maintenanceRequest.listing.landlordId === userId;

  if (userRole !== "ADMIN" && !isTenant && !isLandlord) {
    throw new Error("Unauthorized to view this invoice");
  }

  return invoice;
};

/**
 * Update invoice (general - can update sharedWithTenant, status, etc.)
 */
export const updateInvoice = async (invoiceId, updateData, userId, userRole) => {
  const { status, sharedWithTenant } = updateData;

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      maintenanceRequest: {
        include: {
          listing: true,
        },
      },
      payment: true,
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  // Only landlord can update invoice
  if (userRole !== "ADMIN" && invoice.maintenanceRequest.listing.landlordId !== userId) {
    throw new Error("Only the landlord can update invoice");
  }

  const updatePayload = {};
  if (status !== undefined) {
    updatePayload.status = status;
  }
  if (sharedWithTenant !== undefined) {
    updatePayload.sharedWithTenant = Boolean(sharedWithTenant);
  }

  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: updatePayload,
    include: {
      maintenanceRequest: {
        include: {
          listing: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      payment: true,
    },
  });

  // Log changes
  console.log(`🔄 Invoice ${invoiceId} updated:`, updatePayload);

  return updatedInvoice;
};

/**
 * Update invoice status and associated payment status
 */
export const updateInvoiceStatus = async (invoiceId, status, userId, userRole) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      maintenanceRequest: {
        include: {
          listing: true,
        },
      },
      payment: true,
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  // Only landlord can update invoice status
  if (userRole !== "ADMIN" && invoice.maintenanceRequest.listing.landlordId !== userId) {
    throw new Error("Only the landlord can update invoice status");
  }

  // Map invoice status to payment status
  let paymentStatus = "PENDING";
  if (status === "PAID") {
    paymentStatus = "PAID";
  } else if (status === "CANCELLED") {
    paymentStatus = "CANCELLED";
  }

  // Update both invoice and payment in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update invoice
    const updatedInvoice = await tx.invoice.update({
      where: { id: invoiceId },
      data: { status },
      include: {
        maintenanceRequest: {
          include: {
            listing: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        payment: true,
      },
    });

    // Update associated payment if exists
    if (invoice.paymentId) {
      await tx.payment.update({
        where: { id: invoice.paymentId },
        data: {
          status: paymentStatus,
          paidDate: status === "PAID" ? new Date() : null,
        },
      });
    }

    return updatedInvoice;
  });

  return result;
};

/**
 * Delete invoice and associated payment
 */
export const deleteInvoice = async (invoiceId, userId, userRole) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      maintenanceRequest: {
        include: {
          listing: true,
        },
      },
      payment: true,
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  // Only landlord can delete invoice
  if (userRole !== "ADMIN" && invoice.maintenanceRequest.listing.landlordId !== userId) {
    throw new Error("Only the landlord can delete invoices");
  }

  // Delete invoice and payment in transaction
  await prisma.$transaction(async (tx) => {
    // Delete invoice first (will set payment.invoiceId to null due to SetNull)
    await tx.invoice.delete({
      where: { id: invoiceId },
    });

    // Delete associated payment if exists
    if (invoice.paymentId) {
      await tx.payment.delete({
        where: { id: invoice.paymentId },
      });
    }
  });

  return { message: "Invoice and associated payment deleted successfully" };
};

/**
 * Get all invoices for a user (landlord or tenant)
 */
export const getAllInvoicesForUser = async (userId, userRole, filters = {}) => {
  let where = {};

  if (userRole === "TENANT") {
    // Tenant sees only shared invoices for their maintenance requests
    where = {
      maintenanceRequest: {
        userId,
      },
      sharedWithTenant: true,
    };
  } else if (userRole === "LANDLORD") {
    // Landlord sees invoices for their properties
    where = {
      maintenanceRequest: {
        listing: {
          landlordId: userId,
        },
      },
    };
  }

  // Apply status filter if provided
  if (filters.status) {
    where.status = filters.status;
  }

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      maintenanceRequest: {
        include: {
          listing: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      payment: true,
    },
  });

  return invoices;
};

