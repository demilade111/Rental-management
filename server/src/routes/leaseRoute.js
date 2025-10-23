import { Router } from "express";
import { updateLease, fetchAllLeases, fetchLeaseById } from "../controllers/leaseController.js";
import { authenticate } from "../middleware/AuthMiddleware.js";
import { authorize } from "../middleware/authorizeMiddlewear.js";

const router = Router();



router.get(
  "/:id",
  authenticate,
  authorize(["ADMIN", "LANDLORD"]),
  fetchLeaseById
);




router.get("/", fetchAllLeases);


router.put("/:id", authenticate, authorize(["ADMIN"]), updateLease);

export default router;
