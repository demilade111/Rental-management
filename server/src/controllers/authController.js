import { z } from "zod";
import { registerUser, loginUser } from "../services/authService.js";

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
});

export const register = async (req, res) => {
  try {
    const data = signupSchema.parse(req.body);
    const user = await registerUser(data);

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
