import { prisma } from "../prisma/client.js";
import { generatePublicId } from "../utils/generatePublicId.js";


export async function createApplication(landlordId, data) {
  const listing = await prisma.listing.findUnique({
    where: { id: data.listingId },
  });

  if (!listing) {
    const err = new Error("Listing not found");
    err.status = 404;
    throw err;
  }

  if (listing.landlordId !== landlordId) {
    const err = new Error(
      "You do not have permission to create applications for this listing"
    );
    err.status = 403;
    throw err;
  }

  const publicId = generatePublicId();
  const employmentInfoData = data.employmentInfo
    ? data.employmentInfo.map((info) => ({
      employerName: info.employerName,
      jobTitle: info.jobTitle,
      income: info.income,
      duration: info.duration,
      address: info.address,
      proofDocument: info.proofDocument,
    }))
    : [];
  const application = await prisma.requestApplication.create({
    data: {
      publicId,
      listingId: data.listingId,
      landlordId,
      tenantId: data.tenantId || null,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || null,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      monthlyIncome: data.monthlyIncome || null,
      currentAddress: data.currentAddress || null,
      moveInDate: data.moveInDate ? new Date(data.moveInDate) : null,
      occupants: data.occupants || null,
      pets: data.pets || null,
      documents: data.documents || null,
      references: data.references || null,
      message: data.message || null,
      expirationDate: data.expirationDate
        ? new Date(data.expirationDate)
        : null,
      employmentInfo:
        employmentInfoData.length > 0
          ? { create: employmentInfoData }
          : undefined,
    },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          streetAddress: true,
          city: true,
          state: true,
          rentAmount: true,
        },
      },
      employmentInfo: true,
      tenant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  return application;
}


export async function getAllApplicationsByLandlord(landlordId, filters = {}) {
  const { status, listingId } = filters;

  const whereClause = {
    landlordId,
  };

  if (status) {
    whereClause.status = status;
  }

  if (listingId) {
    whereClause.listingId = listingId;
  }

  const applications = await prisma.requestApplication.findMany({
    where: whereClause,
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          streetAddress: true,
          city: true,
          state: true,
          rentAmount: true,
        },
      },
      employmentInfo: true,
      tenant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      lease: {
        select: {
          id: true,
          startDate: true,
          endDate: true,
          leaseStatus: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return applications;
}


export async function getApplicationByPublicId(publicId) {
  const application = await prisma.requestApplication.findUnique({
    where: { publicId },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          streetAddress: true,
          city: true,
          state: true,
          rentAmount: true,
          securityDeposit: true,
          bedrooms: true,
          bathrooms: true,
          description: true,
          images: {
            take: 5,
          },
        },
      },
      employmentInfo: true,
      landlord: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!application) {
    const err = new Error("Application not found");
    err.status = 404;
    throw err;
  }

  if (application.expirationDate && new Date() > application.expirationDate) {
    const err = new Error("This application link has expired.");
    err.status = 403;
    throw err;
  }

  return application;
}


export async function updateApplicationStatus(applicationId, landlordId, data) {
  const application = await prisma.requestApplication.findUnique({
    where: { id: applicationId },
    include: {
      listing: true,
    },
  });

  if (!application) {
    const err = new Error("Application not found");
    err.status = 404;
    throw err;
  }

  if (application.landlordId !== landlordId) {
    const err = new Error(
      "You do not have permission to update this application"
    );
    err.status = 403;
    throw err;
  }

  if (application.status !== "PENDING") {
    const err = new Error(
      `Cannot update application with status: ${application.status}`
    );
    err.status = 400;
    throw err;
  }


  const result = await prisma.$transaction(async (tx) => {
    const updatedApplication = await tx.requestApplication.update({
      where: { id: applicationId },
      data: {
        status: data.status,
        reviewedBy: landlordId,
        reviewedAt: new Date(),
        decisionNotes: data.decisionNotes || null,
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            streetAddress: true,
            city: true,
            state: true,
            rentAmount: true,
          },
        },
        employmentInfo: true,
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });
    let lease = null;
    if (data.status === "APPROVED" && application.tenantId) {
      const moveInDate = application.moveInDate || new Date();
      const leaseEndDate = new Date(moveInDate);
      leaseEndDate.setFullYear(leaseEndDate.getFullYear() + 1); 

      lease = await tx.lease.create({
        data: {
          listingId: application.listingId,
          tenantId: application.tenantId,
          landlordId: application.landlordId,
          startDate: moveInDate,
          endDate: leaseEndDate,
          rentAmount: application.listing.rentAmount,
          paymentFrequency: application.listing.rentCycle || "MONTHLY",
          securityDeposit: application.listing.securityDeposit || 0,
          leaseStatus: "DRAFT",
          notes: `Auto-generated from application ${application.publicId}`,
        },
      });

  
      await tx.requestApplication.update({
        where: { id: applicationId },
        data: { leaseId: lease.id },
      });
    }

    return { application: updatedApplication, lease };
  });

  return result;
}


export async function deleteApplication(applicationId, landlordId) {
  const application = await prisma.requestApplication.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    const err = new Error("Application not found");
    err.status = 404;
    throw err;
  }

  if (application.landlordId !== landlordId) {
    const err = new Error(
      "You do not have permission to delete this application"
    );
    err.status = 403;
    throw err;
  }
  if (application.status === "APPROVED" && application.leaseId) {
    const err = new Error(
      "Cannot delete approved application with an active lease"
    );
    err.status = 400;
    throw err;
  }

  await prisma.requestApplication.delete({
    where: { id: applicationId },
  });

  return { message: "Application deleted successfully" };
}
