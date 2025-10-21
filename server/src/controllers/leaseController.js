import { createLease, updateLeaseById } from "../services/leaseService.js";
import { createLeaseSchema, updateLeaseSchema } from "../validations/leaseValidation.js";
import { SuccessResponse, HandleError,CreatedResponse } from "../utils/httpResponse.js";


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
