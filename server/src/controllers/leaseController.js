import {
  createLease,
  getAllLeases,
  getLeaseById,
  updateLeaseById,
  deleteLeaseById,
} from "../services/leaseService.js";
import {
  createLeaseSchema,
  updateLeaseSchema,
} from "../validations/leaseValidation.js";
import {
  SuccessResponse,
  HandleError,
  CreatedResponse,
} from "../utils/httpResponse.js";

export const createLeaseController = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const body = createLeaseSchema.parse(req.body);
    const lease = await createLease(landlordId, body);
    return CreatedResponse(res, "Lease created successfully", lease);
  } catch (error) {
    return HandleError(res, error);
  }
};

export const getAllLeasesController = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const filters = {
      leaseStatus: req.query.leaseStatus,
      listingId: req.query.listingId,
    };

    const leases = await getAllLeases(userId, userRole, filters);
    return SuccessResponse(res, 200, "Leases retrieved successfully", leases);
  } catch (error) {
    return HandleError(res, error);
  }
};

export const getLeaseByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const lease = await getLeaseById(id, userId, userRole);
    return SuccessResponse(res, 200, "Lease retrieved successfully", lease);
  } catch (error) {
    return HandleError(res, error);
  }
};

export const updateLeaseController = async (req, res) => {
  try {
    const { id } = req.params;
    const body = updateLeaseSchema.parse(req.body);
    const userId = req.user.id;

    const updatedLease = await updateLeaseById(id, userId, body);
    return SuccessResponse(
      res,
      200,
      "Lease updated successfully",
      updatedLease
    );
  } catch (error) {
    return HandleError(res, error);
  }
};

export const deleteLeaseController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await deleteLeaseById(id, userId);
    return SuccessResponse(res, 200, result.message, null);
  } catch (error) {
    return HandleError(res, error);
  }
};
