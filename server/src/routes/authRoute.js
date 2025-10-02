import { Router } from "express";
import { register, login } from "../controllers/authController.js";
import { authenticate } from "../middleware/AuthMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// Example protected route
router.get("/profile", authenticate, (req, res) => {
    res.json({ message: "This is a protected route", user: req.user });
});

export default router;
