import { updateLeaseById } from "../services/leaseService.js";
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
