import express from "express";
import { getawsS3PresignedUrl } from "../controllers/uploadController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorizeMiddlewear.js";

const router = express.Router();

router.get("/s3-url", authenticate, authorize(["ADMIN"]), getawsS3PresignedUrl);

export default router;
