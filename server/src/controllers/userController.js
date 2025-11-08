import { getUserById } from "../services/userService.js";
import {
  SuccessResponse,
  NotFound,
  HandleError,
} from "../utils/httpResponse.js";

export const getUserProfile = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);

    if (!user) return NotFound(res, "User not found");

    return SuccessResponse(
      res,
      200,
      "User profile retrieved successfully",
      user
    );
  } catch (err) {
    console.error(err);
    return HandleError(res, err);
  }
};
