import { Router } from "express";
import { register, login } from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { signupSchema } from "../validations/authValidation.js";

const router = Router();

router.post("/register", validateRequest(signupSchema), register);
router.post("/login", login);

// protected route
router.get("/profile", authenticate, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

export default router;
