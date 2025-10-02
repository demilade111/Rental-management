import { registerUser, loginUser } from "../services/authService.js";

export const register = async (req, res) => {
    try {
        const user = await registerUser(req.body);
        res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { user, token } = await loginUser(req.body);
        res.status(200).json({ message: "Login successful", token, user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
