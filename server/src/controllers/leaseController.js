import { updateLeaseById, getAllLeases, getLeaseById } from "../services/leaseService.js";
import { updateLeaseSchema } from "../validations/leaseValidation.js";
import { SuccessResponse, HandleError } from "../utils/httpResponse.js";

export const updateLease = async (req, res) => {
  try {
    const { id } = req.params;
    const body = updateLeaseSchema.parse(req.body);
    const userId = req.user.id;

    const updatedLease = await updateLeaseById(id, userId, body);
    return SuccessResponse(res, 200, "Lease updated successfully", updatedLease);
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