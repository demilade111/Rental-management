<<<<<<< HEAD
import { updateLeaseById, getAllLeases, getLeaseById } from "../services/leaseService.js";
import { updateLeaseSchema } from "../validations/leaseValidation.js";
import { SuccessResponse, HandleError } from "../utils/httpResponse.js";
=======
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
>>>>>>> d61f7579554acc6e41dfbd608b083716cef88585

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

/*Exporting all leases functionality*/
export const fetchAllLeases = async (req, res) => {
  try {
    const leases = await getAllLeases();
    return SuccessResponse(res, 200, "Leases were fetched successfully", leases);
  } catch (error) {
    return HandleError(res, error);
  }
};

/*Exporting lease by ID functionality*/

export const fetchLeaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const lease = await getLeaseById(id);
    return SuccessResponse(res, 200, "Lease was fetched successfully", lease);
  } catch (error) {
    return HandleError(res, error);
  }
};