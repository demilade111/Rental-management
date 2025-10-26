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

    const applications = await getAllApplicationsByLandlord(
      landlordId,
      filters
    );

    return SuccessResponse(
      res,
      200,
      "Applications retrieved successfully",
      applications
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
