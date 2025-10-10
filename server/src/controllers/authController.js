import { registerUser, loginUser } from "../services/authService.js";
import { CreatedResponse, SuccessResponse, HandleError } from "../utils/httpResponse.js";

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    return CreatedResponse(res, "User registered successfully", { user });
  } catch (error) {
    return HandleError(res, error);
  }
};

export const login = async (req, res) => {
  try {
    const { user, token } = await loginUser(req.body);
    return SuccessResponse(res, 200, "Login successful", { user, token });
  } catch (error) {
    return HandleError(res, error);
  }
};
