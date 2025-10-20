
import { Router } from "express";
import {
  createListing,
  fetchAllListings,
  fetchListingById,
  deleteListing,
  updateListing,
} from "../controllers/listingController.js";
import { authenticate } from "../middleware/AuthMiddleware.js";
import { authorize } from "../middleware/authorizeMiddlewear.js";

const router = Router();

/**
 * @swagger
 * /api/listings:
 *   post:
 *     summary: Create a new listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Listing created successfully
 *   get:
 *     summary: Get all listings
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all listings
 *
 * /api/listings/{id}:
 *   get:
 *     summary: Get a single listing by ID
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The listing ID
 *     responses:
 *       200:
 *         description: Listing found
 *       404:
 *         description: Listing not found
 *   put:
 *     summary: Update an existing listing by ID
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID to update
 *     responses:
 *       200:
 *         description: Listing updated successfully
 *       403:
 *         description: Forbidden access
 *       404:
 *         description: Listing not found
 */

router.post("/", authenticate, authorize(["ADMIN", "LANDLORD"]), createListing);
router.get(
  "/",
  authenticate,
  authorize(["ADMIN", "LANDLORD"]),
  fetchAllListings
);
router.get(
  "/:id",
  authenticate,
  authorize(["ADMIN", "LANDLORD"]),
  fetchListingById
);
router.put(
  "/:id",
  authenticate,
  authorize(["ADMIN", "LANDLORD"]),
  updateListing
); // ✅ added
router.delete(
  "/:id",
  authenticate,
  authorize(["ADMIN", "LANDLORD"]),
  deleteListing
);

/**
 * @swagger
 * /api/listings/{listingId}/amenities:
 *   post:
 *     summary: Add an amenity to a listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the listing to which the amenity will be added
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pool
 *     responses:
 *       201:
 *         description: Amenity added successfully
 *       404:
 *         description: Listing not found
 *
 * /api/listings/{listingId}/amenities/{amenityId}:
 *   delete:
 *     summary: Remove an amenity from a listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: amenityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Amenity removed successfully
 *       404:
 *         description: Amenity not found
 */

router.post(
  "/:listingId/amenities",
  authenticate,
  authorize(["ADMIN", "LANDLORD"]),
  addListingAmenity
);

router.delete(
  "/:listingId/amenities/:amenityId",
  authenticate,
  authorize(["ADMIN", "LANDLORD"]),
  deleteListingAmenity
);

export default router;
