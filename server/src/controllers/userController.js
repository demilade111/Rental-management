import { getUserById, updateUserProfile, changeUserPassword } from "../services/userService.js";
import {
  SuccessResponse,
  NotFound,
  HandleError,
  BadRequest,
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

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const updatedUser = await updateUserProfile(userId, updates);

    return SuccessResponse(
      res,
      200,
      "Profile updated successfully",
      updatedUser
    );
  } catch (err) {
    console.error("Update profile error:", err);
    if (err.message === "Email is already in use") {
      return BadRequest(res, err.message);
    }
    return HandleError(res, err);
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return BadRequest(res, "Current password and new password are required");
    }

    if (newPassword.length < 6) {
      return BadRequest(res, "Password must be at least 6 characters long");
    }

    await changeUserPassword(userId, currentPassword, newPassword);

    return SuccessResponse(
      res,
      200,
      "Password changed successfully",
      null
    );
  } catch (err) {
    console.error("Change password error:", err);
    if (err.message === "Current password is incorrect") {
      return BadRequest(res, err.message);
    }
    if (err.message === "User not found") {
      return NotFound(res, err.message);
    }
    return HandleError(res, err);
  }
};
