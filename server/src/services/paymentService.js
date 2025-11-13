import { prisma } from '../prisma/client.js';

/**
 * Payment Service
 * Handles all payment-related business logic
 */

/**
 * Get all payments for a landlord with filtering and summary
 */
export const getPaymentsForLandlord = async (landlordId, filters = {}) => {
  const { search, status, type, category } = filters;

  const where = {
    landlordId,
    ...(status && status !== 'ALL' && { status }),
    ...(type && type !== 'ALL' && { type }),
  };

  // Search filter
  if (search) {
    where.OR = [
      {
        tenant: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      },
      { reference: { contains: search, mode: 'insensitive' } },
      { notes: { contains: search, mode: 'insensitive' } },
    ];
  }

  const payments = await prisma.payment.findMany({
    where,
    include: {
      tenant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      lease: {
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              streetAddress: true,
              city: true,
              state: true,
              country: true,
              propertyType: true,
            },
          },
        },
      },
      customLease: {
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              streetAddress: true,
              city: true,
              state: true,
              country: true,
              propertyType: true,
            },
          },
        },
      },
      invoice: {
        include: {
          maintenanceRequest: {
            include: {
              listing: {
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
          },
        },
      },
    },
    orderBy: [
      { dueDate: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  // Calculate summaries
  const summary = await calculatePaymentSummary(landlordId);

  return { payments, summary };
};

/**
 * Calculate payment summary for landlord
 */
export const calculatePaymentSummary = async (landlordId) => {
  const now = new Date();

  // Outstanding balances (PENDING status)
  const outstanding = await prisma.payment.groupBy({
    by: ['type'],
    where: {
      landlordId,
      status: 'PENDING',
    },
    _sum: {
      amount: true,
    },
  });

  // Overdue payments (PENDING status with past due date)
  const overdue = await prisma.payment.groupBy({
    by: ['type'],
    where: {
      landlordId,
      status: 'PENDING',
      dueDate: {
        lt: now,
      },
    },
    _sum: {
      amount: true,
    },
  });

  // Paid amounts this month
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const paid = await prisma.payment.groupBy({
    by: ['type'],
    where: {
      landlordId,
      status: 'PAID',
      paidDate: {
        gte: firstDayOfMonth,
      },
    },
    _sum: {
      amount: true,
    },
  });

  // Format the results
  const formatBreakdown = (data) => {
    const breakdown = {
      rent: 0,
      deposit: 0,
      maintenance: 0,
      other: 0,
    };

    data.forEach((item) => {
      const type = item.type.toLowerCase();
      if (type === 'rent') breakdown.rent = item._sum.amount || 0;
      else if (type === 'deposit') breakdown.deposit = item._sum.amount || 0;
      else if (type === 'maintenance') breakdown.maintenance = item._sum.amount || 0;
      else breakdown.other += item._sum.amount || 0;
    });

    return breakdown;
  };

  const outstandingBreakdown = formatBreakdown(outstanding);
  const overdueBreakdown = formatBreakdown(overdue);
  const paidBreakdown = formatBreakdown(paid);

  return {
    outstanding: {
      total: Object.values(outstandingBreakdown).reduce((sum, val) => sum + val, 0),
      breakdown: outstandingBreakdown,
    },
    overdue: {
      total: Object.values(overdueBreakdown).reduce((sum, val) => sum + val, 0),
      breakdown: overdueBreakdown,
    },
    paid: {
      total: Object.values(paidBreakdown).reduce((sum, val) => sum + val, 0),
      breakdown: paidBreakdown,
    },
  };
};

/**
 * Get payment by ID
 */
export const getPaymentById = async (paymentId, landlordId) => {
  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      landlordId,
    },
    include: {
      tenant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
        },
      },
      lease: {
        include: {
          listing: true,
        },
      },
      customLease: {
        include: {
          listing: true,
        },
      },
      // TODO: Uncomment after migration
      // invoice: {
      //   include: {
      //     maintenanceRequest: {
      //       include: {
      //         listing: true,
      //       },
      //     },
      //   },
      // },
    },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  return payment;
};

/**
 * Create a new payment
 */
export const createPayment = async (landlordId, paymentData) => {
  const {
    leaseId,
    customLeaseId,
    tenantId,
    type,
    amount,
    dueDate,
    paymentMethod,
    reference,
    notes,
  } = paymentData;

  // Validate that either leaseId or customLeaseId is provided
  if (!leaseId && !customLeaseId) {
    throw new Error('Either leaseId or customLeaseId must be provided');
  }

  const payment = await prisma.payment.create({
    data: {
      landlordId,
      leaseId: leaseId || null,
      customLeaseId: customLeaseId || null,
      tenantId: tenantId || null,
      type,
      amount,
      status: 'PENDING',
      dueDate: dueDate ? new Date(dueDate) : null,
      paymentMethod,
      reference,
      notes,
    },
    include: {
      tenant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      lease: {
        include: {
          listing: true,
        },
      },
      customLease: {
        include: {
          listing: true,
        },
      },
    },
  });

  return payment;
};

/**
 * Update payment
 */
export const updatePayment = async (paymentId, landlordId, updates) => {
  // Check if payment exists and belongs to landlord
  const existingPayment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      landlordId,
    },
  });

  if (!existingPayment) {
    throw new Error('Payment not found');
  }

  const {
    type,
    amount,
    status,
    dueDate,
    paidDate,
    paymentMethod,
    reference,
    notes,
  } = updates;

  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      ...(type && { type }),
      ...(amount !== undefined && { amount }),
      ...(status && { status }),
      ...(dueDate && { dueDate: new Date(dueDate) }),
      ...(paidDate && { paidDate: new Date(paidDate) }),
      ...(paymentMethod !== undefined && { paymentMethod }),
      ...(reference !== undefined && { reference }),
      ...(notes !== undefined && { notes }),
    },
    include: {
      tenant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      lease: {
        include: {
          listing: true,
        },
      },
      customLease: {
        include: {
          listing: true,
        },
      },
    },
  });

  return payment;
};

/**
 * Mark payment as paid
 */
export const markPaymentAsPaid = async (paymentId, landlordId, paymentDetails = {}) => {
  const { paidDate, paymentMethod, reference, notes } = paymentDetails;

  const payment = await prisma.payment.update({
    where: {
      id: paymentId,
      landlordId,
    },
    data: {
      status: 'PAID',
      paidDate: paidDate ? new Date(paidDate) : new Date(),
      ...(paymentMethod && { paymentMethod }),
      ...(reference && { reference }),
      ...(notes && { notes }),
    },
    include: {
      tenant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return payment;
};

/**
 * Delete payment
 */
export const deletePayment = async (paymentId, landlordId) => {
  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      landlordId,
    },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  await prisma.payment.delete({
    where: { id: paymentId },
  });

  return { message: 'Payment deleted successfully' };
};

/**
 * Send payment reminder notification
 */
export const sendPaymentReminder = async (paymentId, landlordId) => {
  const payment = await getPaymentById(paymentId, landlordId);

  if (!payment.tenant) {
    throw new Error('No tenant associated with this payment');
  }

  if (payment.status === 'PAID') {
    throw new Error('Cannot send reminder for paid payment');
  }

  // Create notification
  await prisma.notification.create({
    data: {
      userId: payment.tenantId,
      type: 'PAYMENT_REMINDER',
      title: 'Payment Reminder',
      message: `You have a ${payment.type.toLowerCase()} payment of $${payment.amount.toFixed(
        2
      )} due${payment.dueDate ? ` on ${payment.dueDate.toLocaleDateString()}` : ''}.`,
      relatedId: payment.id,
      relatedType: 'PAYMENT',
    },
  });

  return { message: 'Payment reminder sent successfully' };
};

/**
 * Get all payments for a tenant
 */
export const getPaymentsForTenant = async (tenantId, filters = {}) => {
  const { search, status, type } = filters;

  const where = {
    tenantId,
    ...(status && status !== 'ALL' && { status }),
    ...(type && type !== 'ALL' && { type }),
  };

  // Search filter
  if (search) {
    where.OR = [
      {
        lease: {
          listing: {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { streetAddress: { contains: search, mode: 'insensitive' } },
              { city: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      },
      {
        customLease: {
          listing: {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { streetAddress: { contains: search, mode: 'insensitive' } },
              { city: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      },
      { reference: { contains: search, mode: 'insensitive' } },
      { notes: { contains: search, mode: 'insensitive' } },
    ];
  }

  const payments = await prisma.payment.findMany({
    where,
    include: {
      tenant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      lease: {
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              streetAddress: true,
              city: true,
              state: true,
              country: true,
              propertyType: true,
            },
          },
        },
      },
      customLease: {
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              streetAddress: true,
              city: true,
              state: true,
              country: true,
              propertyType: true,
            },
          },
        },
      },
      invoice: {
        select: {
          id: true,
          amount: true,
          description: true,
          status: true,
          sharedWithTenant: true, // Important for filtering
          createdAt: true, // Added for invoice details modal
          updatedAt: true, // Added for completeness
          maintenanceRequest: {
            include: {
              listing: {
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
          },
        },
      },
    },
    orderBy: [
      { dueDate: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  // Debug logging - show all payments before filtering
  console.log(`\n📊 TENANT PAYMENT FETCH - Tenant ID: ${tenantId}`);
  console.log(`Total payments fetched: ${payments.length}`);
  payments.forEach((payment, idx) => {
    console.log(`  [${idx}] Type: ${payment.type}, Amount: ${payment.amount}, Invoice: ${payment.invoice ? 'Yes' : 'No'}, Shared: ${payment.invoice?.sharedWithTenant}`);
  });

  // Filter out payments for invoices that are NOT shared with tenant
  const filteredPayments = payments.filter(payment => {
    // If payment has an invoice, only show if it's shared with tenant
    if (payment.invoice) {
      const shouldShow = payment.invoice.sharedWithTenant === true;
      if (!shouldShow) {
        console.log(`  🔒 HIDING: ${payment.type} payment (invoice not shared)`);
      }
      return shouldShow;
    }
    // If no invoice (regular rent/deposit), always show
    return true;
  });

  // Debug logging
  const hiddenCount = payments.length - filteredPayments.length;
  console.log(`\n✅ RESULT: Showing ${filteredPayments.length} payments (${hiddenCount} hidden)\n`);

  return filteredPayments;
};

/**
 * Calculate payment summary for tenant
 */
export const calculateTenantPaymentSummary = async (tenantId) => {
  const now = new Date();

  // Outstanding balance (PENDING status)
  const outstandingResult = await prisma.payment.aggregate({
    where: {
      tenantId,
      status: 'PENDING',
    },
    _sum: {
      amount: true,
    },
  });

  // Overdue payments (PENDING status with past due date)
  const overdueResult = await prisma.payment.aggregate({
    where: {
      tenantId,
      status: 'PENDING',
      dueDate: {
        lt: now,
      },
    },
    _sum: {
      amount: true,
    },
  });

  // Paid amounts this month
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const paidThisMonthResult = await prisma.payment.aggregate({
    where: {
      tenantId,
      status: 'PAID',
      paidDate: {
        gte: firstDayOfMonth,
      },
    },
    _sum: {
      amount: true,
    },
  });

  // Total paid all time
  const totalPaidResult = await prisma.payment.aggregate({
    where: {
      tenantId,
      status: 'PAID',
    },
    _sum: {
      amount: true,
    },
  });

  return {
    outstandingBalance: outstandingResult._sum.amount || 0,
    overduePayments: overdueResult._sum.amount || 0,
    paidThisMonth: paidThisMonthResult._sum.amount || 0,
    totalPaid: totalPaidResult._sum.amount || 0,
  };
};

/**
 * Upload payment receipt/proof
 * Status changes to PENDING (awaiting landlord approval)
 */
export const uploadPaymentProof = async (paymentId, proofUrl, tenantId) => {
  // Verify the payment belongs to the tenant
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  if (payment.tenantId !== tenantId) {
    throw new Error('Unauthorized: Payment does not belong to this tenant');
  }

  // Update payment with proof URL - status stays PENDING until landlord approves
  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      proofUrl,
      // Keep status as PENDING - landlord needs to approve
    },
    include: {
      tenant: true,
      lease: {
        include: {
          listing: true,
        },
      },
      customLease: {
        include: {
          listing: true,
        },
      },
    },
  });

  return updatedPayment;
};

/**
 * Approve payment receipt (Landlord only)
 */
export const approvePaymentReceipt = async (paymentId, landlordId) => {
  // Check if payment exists and belongs to landlord
  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      landlordId,
    },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  if (!payment.proofUrl) {
    throw new Error('No receipt uploaded for this payment');
  }

  // Update payment to PAID status
  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'PAID',
      paidDate: new Date(),
    },
    include: {
      tenant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      lease: {
        include: {
          listing: true,
        },
      },
      customLease: {
        include: {
          listing: true,
        },
      },
    },
  });

  // TODO: Send notification to tenant about approval

  return updatedPayment;
};

/**
 * Reject payment receipt (Landlord only)
 */
export const rejectPaymentReceipt = async (paymentId, landlordId, reason = null) => {
  // Check if payment exists and belongs to landlord
  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      landlordId,
    },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  if (!payment.proofUrl) {
    throw new Error('No receipt uploaded for this payment');
  }

  // Update payment - remove proof URL and add rejection reason in notes
  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      proofUrl: null, // Remove rejected receipt
      notes: reason ? `Receipt rejected: ${reason}` : 'Receipt rejected by landlord',
      // Keep status as PENDING
    },
    include: {
      tenant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      lease: {
        include: {
          listing: true,
        },
      },
      customLease: {
        include: {
          listing: true,
        },
      },
    },
  });

  // TODO: Send notification to tenant about rejection

  return updatedPayment;
};

