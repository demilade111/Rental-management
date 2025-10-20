import {
  createMaintenanceRequestSchema,
  updateMaintenanceRequestSchema,
} from "../validations/maintenanceValidation.js";
import {
  createMaintenanceRequest,
  getAllMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
} from "../services/maintenanceService.js";
import {
  CreatedResponse,
  SuccessResponse,
  HandleError,
} from "../utils/httpResponse.js";

async function createMaintenance(req, res) {
  try {
    const body = createMaintenanceRequestSchema.parse(req.body);
    const userId = req.user.id;
    const maintenanceRequest = await createMaintenanceRequest(userId, body);

    return CreatedResponse(
      res,
      "Maintenance request created successfully",
      maintenanceRequest
    );
  } catch (error) {
    return HandleError(res, error);
  }
}

async function fetchAllMaintenanceRequests(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const filters = {
      status: req.query.status,
      priority: req.query.priority,
      category: req.query.category,
      listingId: req.query.listingId,
    };

    const maintenanceRequests = await getAllMaintenanceRequests(
      userId,
      userRole,
      filters
    );

    return SuccessResponse(
      res,
      200,
      "Maintenance requests fetched successfully",
      maintenanceRequests
    );
  } catch (error) {
    return HandleError(res, error);
  }
}

async function fetchMaintenanceRequestById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const maintenanceRequest = await getMaintenanceRequestById(
      id,
      userId,
      userRole
    );

    return SuccessResponse(
      res,
      200,
      "Maintenance request fetched successfully",
      maintenanceRequest
    );
  } catch (error) {
    return HandleError(res, error);
  }
}

async function updateMaintenance(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const updates = updateMaintenanceRequestSchema.parse(req.body);

    const updatedRequest = await updateMaintenanceRequest(
      id,
      userId,
      userRole,
      updates
    );

    return SuccessResponse(
      res,
      200,
      "Maintenance request updated successfully",
      updatedRequest
    );
  } catch (error) {
    return HandleError(res, error);
  }
}

async function deleteMaintenance(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const result = await deleteMaintenanceRequest(id, userId, userRole);

    return SuccessResponse(res, 200, result.message);
  } catch (error) {
    return HandleError(res, error);
  }
}

export {
  createMaintenance,
  fetchAllMaintenanceRequests,
  fetchMaintenanceRequestById,
  updateMaintenance,
  deleteMaintenance,
};
