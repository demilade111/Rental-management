import { prisma } from "../prisma/client.js";

export async function createInsurance(data) {
  const {
    tenantId,
    leaseId,
    customLeaseId,
    providerName,
    policyNumber,
    coverageType,
    coverageAmount,
    monthlyCost,
    startDate,
    expiryDate,
    documentUrl,
    documentKey,
    notes,
  } = data;

  if (new Date(expiryDate) <= new Date(startDate)) {
    const error = new Error("Expiry date must be after start date");
    error.status = 400;
    throw error;
  }

  const insurance = await prisma.tenantInsurance.create({
    data: {
      tenantId,
      leaseId,
      customLeaseId,
      providerName,
      policyNumber,
      coverageType,
      coverageAmount,
      monthlyCost,
      startDate: new Date(startDate),
      expiryDate: new Date(expiryDate),
      documentUrl,
      documentKey,
      notes,
      status: "PENDING",
    },
    include: {
      tenant: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      lease: {
        select: {
          id: true,
          propertyAddress: true,
          landlordId: true,
        },
      },
      customLease: {
        select: {
          id: true,
          leaseName: true,
          landlordId: true,
        },
      },
    },
  });

  return insurance;
}

export async function getInsuranceById(insuranceId) {
  const insurance = await prisma.tenantInsurance.findUnique({
    where: { id: insuranceId },
    include: {
      tenant: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
      lease: {
        select: {
          id: true,
          propertyAddress: true,
          landlordId: true,
          listing: {
            select: {
              title: true,
              streetAddress: true,
            },
          },
        },
      },
      customLease: {
        select: {
          id: true,
          leaseName: true,
          landlordId: true,
        },
      },
      verifier: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!insurance) {
    const error = new Error("Insurance record not found");
    error.status = 404;
    throw error;
  }

  return insurance;
}

export async function getAllInsurances(filters = {}) {
  const {
    tenantId,
    landlordId,
    status,
    leaseId,
    customLeaseId,
    expiringBefore,
    page = 1,
    limit = 50,
  } = filters;

  const where = {};

  if (tenantId) {
    where.tenantId = tenantId;
  }

  if (status) {
    where.status = status;
  }

  if (leaseId) {
    where.leaseId = leaseId;
  }

  if (customLeaseId) {
    where.customLeaseId = customLeaseId;
  }

  if (expiringBefore) {
    where.expiryDate = {
      lte: new Date(expiringBefore),
    };
  }

  if (landlordId) {
    where.OR = [
      {
        lease: {
          landlordId: landlordId,
        },
      },
      {
        customLease: {
          landlordId: landlordId,
        },
      },
    ];
  }

  const skip = (page - 1) * limit;

  const [insurances, total] = await Promise.all([
    prisma.tenantInsurance.findMany({
      where,
      include: {
        tenant: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        lease: {
          select: {
            id: true,
            propertyAddress: true,
            landlordId: true,
            listing: {
              select: {
                title: true,
                streetAddress: true,
              },
            },
          },
        },
        customLease: {
          select: {
            id: true,
            leaseName: true,
            landlordId: true,
          },
        },
        verifier: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.tenantInsurance.count({ where }),
  ]);

  return {
    insurances,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateInsurance(insuranceId, tenantId, updateData) {
  const insurance = await prisma.tenantInsurance.findUnique({
    where: { id: insuranceId },
  });

  if (!insurance) {
    const error = new Error("Insurance record not found");
    error.status = 404;
    throw error;
  }

  if (insurance.tenantId !== tenantId) {
    const error = new Error("Unauthorized to update this insurance record");
    error.status = 403;
    throw error;
  }

  if (insurance.status !== "PENDING" && insurance.status !== "REJECTED") {
    const error = new Error(
      "Cannot update insurance that has been verified or is expired"
    );
    error.status = 400;
    throw error;
  }

  if (updateData.expiryDate && updateData.startDate) {
    if (new Date(updateData.expiryDate) <= new Date(updateData.startDate)) {
      const error = new Error("Expiry date must be after start date");
      error.status = 400;
      throw error;
    }
  }

  const allowedUpdates = {
    providerName: updateData.providerName,
    policyNumber: updateData.policyNumber,
    coverageType: updateData.coverageType,
    coverageAmount: updateData.coverageAmount,
    monthlyCost: updateData.monthlyCost,
    startDate: updateData.startDate
      ? new Date(updateData.startDate)
      : undefined,
    expiryDate: updateData.expiryDate
      ? new Date(updateData.expiryDate)
      : undefined,
    documentUrl: updateData.documentUrl,
    documentKey: updateData.documentKey,
    notes: updateData.notes,
  };

  Object.keys(allowedUpdates).forEach((key) => {
    if (allowedUpdates[key] === undefined) {
      delete allowedUpdates[key];
    }
  });

  const updatedInsurance = await prisma.tenantInsurance.update({
    where: { id: insuranceId },
    data: allowedUpdates,
    include: {
      tenant: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      lease: true,
      customLease: true,
    },
  });

  return updatedInsurance;
}

export async function verifyInsurance(insuranceId, landlordId) {
  const insurance = await prisma.tenantInsurance.findUnique({
    where: { id: insuranceId },
    include: {
      lease: {
        select: {
          landlordId: true,
        },
      },
      customLease: {
        select: {
          landlordId: true,
        },
      },
    },
  });

  if (!insurance) {
    const error = new Error("Insurance record not found");
    error.status = 404;
    throw error;
  }

  const isLandlord =
    insurance.lease?.landlordId === landlordId ||
    insurance.customLease?.landlordId === landlordId;

  if (!isLandlord) {
    const error = new Error("Unauthorized to verify this insurance record");
    error.status = 403;
    throw error;
  }

  const now = new Date();
  const expiryDate = new Date(insurance.expiryDate);
  const daysUntilExpiry = Math.floor(
    (expiryDate - now) / (1000 * 60 * 60 * 24)
  );

  let status = "VERIFIED";
  if (expiryDate < now) {
    status = "EXPIRED";
  } else if (daysUntilExpiry <= 30) {
    status = "EXPIRING_SOON";
  }

  const verifiedInsurance = await prisma.tenantInsurance.update({
    where: { id: insuranceId },
    data: {
      status,
      verifiedBy: landlordId,
      verifiedAt: now,
      rejectionReason: null,
    },
    include: {
      tenant: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      lease: true,
      customLease: true,
      verifier: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return verifiedInsurance;
}

export async function rejectInsurance(
  insuranceId,
  landlordId,
  rejectionReason
) {
  const insurance = await prisma.tenantInsurance.findUnique({
    where: { id: insuranceId },
    include: {
      lease: {
        select: {
          landlordId: true,
        },
      },
      customLease: {
        select: {
          landlordId: true,
        },
      },
    },
  });

  if (!insurance) {
    const error = new Error("Insurance record not found");
    error.status = 404;
    throw error;
  }

  const isLandlord =
    insurance.lease?.landlordId === landlordId ||
    insurance.customLease?.landlordId === landlordId;

  if (!isLandlord) {
    const error = new Error("Unauthorized to reject this insurance record");
    error.status = 403;
    throw error;
  }

  const rejectedInsurance = await prisma.tenantInsurance.update({
    where: { id: insuranceId },
    data: {
      status: "REJECTED",
      rejectionReason,
      verifiedBy: landlordId,
      verifiedAt: new Date(),
    },
    include: {
      tenant: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      lease: true,
      customLease: true,
      verifier: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return rejectedInsurance;
}

export async function getExpiringInsurances(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  const insurances = await prisma.tenantInsurance.findMany({
    where: {
      expiryDate: {
        lte: futureDate,
        gte: new Date(),
      },
      status: {
        in: ["VERIFIED", "EXPIRING_SOON"],
      },
    },
    include: {
      tenant: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      lease: {
        select: {
          id: true,
          landlordId: true,
          landlord: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      customLease: {
        select: {
          id: true,
          landlordId: true,
          landlord: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  return insurances;
}

export async function getExpiredInsurances() {
  const insurances = await prisma.tenantInsurance.findMany({
    where: {
      expiryDate: {
        lt: new Date(),
      },
      status: {
        not: "EXPIRED",
      },
    },
    include: {
      tenant: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      lease: {
        select: {
          id: true,
          landlordId: true,
          landlord: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      customLease: {
        select: {
          id: true,
          landlordId: true,
          landlord: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  return insurances;
}

export async function updateInsuranceStatus(insuranceId, status) {
  const updatedInsurance = await prisma.tenantInsurance.update({
    where: { id: insuranceId },
    data: { status },
  });

  return updatedInsurance;
}
