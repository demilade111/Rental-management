import { Router } from "express";
import { updateLease, fetchAllLeases, fetchLeaseById } from "../controllers/leaseController.js";
import { authenticate } from "../middleware/AuthMiddleware.js";
import { authorize } from "../middleware/authorizeMiddlewear.js";

const router = Router();

router.get("/test", (_req, res) => {
  console.log("Test route hit");
  res.json({ message: "Lease test route works!" });
});

/**
 * @swagger
 * /api/v1/leases:
 *   get:
 *     summary: Retrieve all leases
 *     tags: [Leases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all leases
 *         content:
 *          application/json:
 *      schema:
 *          type: object
 *           properties:
 *      status:
 *           type: string
 *           example: success
 *      code:
 *           type: integer
 *           example: 200
 *           message:
 *           type: string
 *           example: Leases fetched successfully
 *       data:
 *           type: array
 *       items:
 *           $ref: '#/components/schemas/Lease'
 */

router.get("/", authenticate, authorize(["ADMIN", "LANDLORD"]), fetchAllLeases);


/**
 * @swagger
 * /api/v1/leases/{id}:
 *   get:
 *     summary: Retrieve a single lease by ID
 *     tags: [Leases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the lease to fetch
 *     responses:
 *       200:
 *         description: Lease found
 *         content:
 *         application/json:
 *          schema:
 *          type: object
 *          properties:
 *      status:
 *          type: string
 *          example: success
 *          code:
 *          type: integer
 *          example: 200
 *          message:
 *          type: string
 *          example: Lease fetched successfully
 *          data:
 *          $ref: '#/components/schemas/Lease'
 *       404:
 *         description: Lease not found
 */

router.get(
  "/:id",
  authenticate,
  authorize(["ADMIN", "LANDLORD"]),
  fetchLeaseById
);




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
