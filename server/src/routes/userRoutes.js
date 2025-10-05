import { Router } from "express";
import { authenticate } from "../middleware/AuthMiddleware.js";
import { getUserProfile } from "../controllers/userController.js";

const router = Router();
router.get("/profile", authenticate, getUserProfile);

export default router;
