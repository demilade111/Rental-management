import express from "express";
import { 
    generateLeaseInviteController, 
    getLeaseInviteController, 
    signLeaseController 
} from "../controllers/inviteLeaseController.js";
import { authenticate } from "../middleware/AuthMiddleware.js";

const router = express.Router();

// POST /api/v1/leases-invite/:id/invite
router.post("/:id/invite", authenticate, generateLeaseInviteController);

// GET /api/v1/leases-invite/invite/:token
router.get("/invite/:token", authenticate, getLeaseInviteController);

// POST /api/v1/leases-invite/sign/:token
router.post("/sign/:token", authenticate, signLeaseController);

export default router;
