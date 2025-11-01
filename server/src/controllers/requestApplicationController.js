import {
  createApplicationSchema,
  updateApplicationStatusSchema,
} from "../validations/requestApplicationValidation.js";
import {
  createApplication,
  getAllApplicationsByLandlord,
  getApplicationByPublicId,
  updateApplicationStatus,
  deleteApplication,
} from "../services/requestApplicationService.js";
import {
  CreatedResponse,
  SuccessResponse,
  HandleError,
} from "../utils/httpResponse.js";
import { prisma, ApplicationStatus } from "../prisma/client.js";

export async function createApplicationController(req, res) {
  try {
    const landlordId = req.user.id;
    const body = createApplicationSchema.parse(req.body);

    const application = await createApplication(landlordId, body);

    return CreatedResponse(
      res,
      "Application created successfully",
      application
    );
  } catch (error) {
    return HandleError(res, error);
  }
}

export async function getAllApplicationsController(req, res) {
  try {
    const landlordId = req.user.id;
    const filters = {
      status: req.query.status,
      listingId: req.query.listingId,
    };

    const page = parseInt(req.query.page, 10) || 1; // default page 1
    const limit = parseInt(req.query.limit, 10) || 10; // default 10 items per page
    const skip = (page - 1) * limit;

    const { applications, total } = await getAllApplicationsByLandlord(
      landlordId,
      filters,
      skip,
      limit
    );

    return SuccessResponse(res, 200, "Applications retrieved successfully", {
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return HandleError(res, error);
  }
}

export async function submitPublicApplicationController(req, res) {
  try {
    const { publicId } = req.params;
    const data = req.body;


    const application = await prisma.requestApplication.findUnique({
      where: { publicId },
    });

    if (!application) {
      const err = new Error("Application not found");
      err.status = 404;
      throw err;
    }


    if (application.expirationDate && new Date() > application.expirationDate) {
      return res
        .status(403)
        .json({ message: "This application link has expired." });
    }

    const updatedApplication = await prisma.requestApplication.update({
      where: { publicId },
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        currentAddress: data.currentAddress || null,
        moveInDate: data.moveInDate ? new Date(data.moveInDate) : null,
        monthlyIncome: data.monthlyIncome || null,
        message: data.message || null,
        documents: data.documents || null,
        references: data.references || null,
        status: ApplicationStatus.NEW,
      },
    });

    // Optionally, create employmentInfo if provided
    if (data.employmentInfo && data.employmentInfo.length > 0) {
      await Promise.all(
        data.employmentInfo.map((info) =>
          prisma.employmentInfo.create({
            data: {
              applicationId: updatedApplication.id,
              employerName: info.employerName,
              jobTitle: info.jobTitle,
              income: info.income || null,
              duration: info.duration || null,
              address: info.address || null,
              proofDocument: info.proofDocument || null,
            },
          })
        )
      );
    }

    return SuccessResponse(
      res,
      200,
      "Application submitted successfully",
      updatedApplication
    );
  } catch (error) {
    return HandleError(res, error);
  }
}

export async function getApplicationByPublicIdController(req, res) {
  try {
    const { publicId } = req.params;

    const application = await getApplicationByPublicId(publicId);

    return SuccessResponse(
      res,
      200,
      "Application retrieved successfully",
      application
    );
  } catch (error) {
    return HandleError(res, error);
  }
}

export async function updateApplicationStatusController(req, res) {
  try {
    const { id } = req.params;
    const landlordId = req.user.id;
    const body = updateApplicationStatusSchema.parse(req.body);

    const result = await updateApplicationStatus(id, landlordId, body);

    const message =
      body.status === "APPROVED"
        ? "Application approved and lease created"
        : `Application ${body.status.toLowerCase()} successfully`;

    return SuccessResponse(res, 200, message, result);
  } catch (error) {
    return HandleError(res, error);
  }
}

export async function deleteApplicationController(req, res) {
  try {
    const { id } = req.params;
    const landlordId = req.user.id;

    const result = await deleteApplication(id, landlordId);

    return SuccessResponse(res, 200, result.message);
  } catch (error) {
    return HandleError(res, error);
  }
}
