import { Router } from "express";
import { updateLease } from "../controllers/leaseController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorizeMiddlewear.js";

const router = Router();

/**
 * @swagger
 * /api/v1/leases/{id}:
 *   put:
 *     summary: Update lease details
 *     tags: [Leases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The lease ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               endDate:
 *                 type: string
 *                 format: date
 *               rentAmount:
 *                 type: number
 *               leaseStatus:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lease updated successfully
 *       404:
 *         description: Lease not found
 */

router.put("/:id", authenticate, authorize(["ADMIN"]), updateLease);

export default router;
