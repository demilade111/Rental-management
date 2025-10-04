import { registerUser, loginUser, requestPasswordReset, resetPassword } from "../services/authService.js";

export const register = async (req, res) => {
    try {
        const user = await registerUser(req.body);
        return res.status(201).json({
            message: "User registered successfully",
            user,
        });
    } catch (error) {
        if (error?.errors?.length) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        return res.status(400).json({ error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { user, token } = await loginUser(req.body);
        return res.status(200).json({ message: "Login successful", token, user });
    } catch (error) {
        return res.status(400).json({ error: error.message });
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
