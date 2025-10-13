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

//Controller for requesting password reset
export const requestReset = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });

        const token = await requestPasswordReset(email);
        res.json({ message: "Password reset token generated", token });
    } catch (err) {

        return res.status(400).json({ error: err.message });
        
    }
     };

//Controller for resetting password using the token
export const resetController = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ error: "Token and new password are required" });
        }   

        await resetPassword(token, newPassword);
        res.json({ message: "Password has been reset successfully" });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};
