import { Router } from "express";
import { createListing } from "../controllers/listingController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorizeMiddlewear.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Listing:
 *       type: object
 *       required:
 *         - title
 *         - category
 *         - address
 *         - city
 *         - state
 *         - country
 *         - rentAmount
 *         - rentCycle
 *         - availableDate
 *       properties:
 *         id:
 *           type: string
 *           description: Unique listing identifier
 *         landlordId:
 *           type: string
 *           description: ID of the landlord who owns the listing
 *         title:
 *           type: string
 *           description: Property title
 *         description:
 *           type: string
 *           description: Detailed property description
 *         category:
 *           type: string
 *           enum: [RESIDENTIAL, COMMERCIAL]
 *           description: Property category
 *         residentialType:
 *           type: string
 *           enum: [APARTMENT, CONDO, TOWNHOUSE, MULTI_FAMILY, SINGLE_FAMILY, STUDIO]
 *           description: Type of residential property
 *         commercialType:
 *           type: string
 *           enum: [INDUSTRIAL, OFFICE, RETAIL, SHOPPING_CENTER, STORAGE, PARKING_SPACE, WAREHOUSE]
 *           description: Type of commercial property
 *         address:
 *           type: string
 *           description: Street address
 *         city:
 *           type: string
 *           description: City
 *         state:
 *           type: string
 *           description: State/Province
 *         country:
 *           type: string
 *           description: Country
 *         zipCode:
 *           type: string
 *           description: ZIP/Postal code
 *         bedrooms:
 *           type: integer
 *           description: Number of bedrooms
 *         bathrooms:
 *           type: integer
 *           description: Number of bathrooms
 *         size:
 *           type: integer
 *           description: Property size in square feet
 *         yearBuilt:
 *           type: integer
 *           description: Year the property was built
 *         rentAmount:
 *           type: number
 *           description: Rental amount
 *         rentCycle:
 *           type: string
 *           enum: [MONTHLY, QUARTERLY, YEARLY]
 *           description: Rent payment cycle
 *         securityDeposit:
 *           type: number
 *           description: Security deposit amount
 *         availableDate:
 *           type: string
 *           format: date-time
 *           description: Date when property becomes available
 *         amenities:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               url:
 *                 type: string
 *               isPrimary:
 *                 type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/listings:
 *   post:
 *     summary: Create a new listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - address
 *               - city
 *               - state
 *               - country
 *               - rentAmount
 *               - rentCycle
 *               - availableDate
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Modern 2BR Apartment"
 *               description:
 *                 type: string
 *                 example: "Beautiful apartment in downtown"
 *               category:
 *                 type: string
 *                 enum: [RESIDENTIAL, COMMERCIAL]
 *                 example: "RESIDENTIAL"
 *               residentialType:
 *                 type: string
 *                 enum: [APARTMENT, CONDO, TOWNHOUSE, MULTI_FAMILY, SINGLE_FAMILY, STUDIO]
 *                 example: "APARTMENT"
 *               commercialType:
 *                 type: string
 *                 enum: [INDUSTRIAL, OFFICE, RETAIL, SHOPPING_CENTER, STORAGE, PARKING_SPACE, WAREHOUSE]
 *               address:
 *                 type: string
 *                 example: "123 Main St"
 *               city:
 *                 type: string
 *                 example: "New York"
 *               state:
 *                 type: string
 *                 example: "NY"
 *               country:
 *                 type: string
 *                 example: "USA"
 *               zipCode:
 *                 type: string
 *                 example: "10001"
 *               bedrooms:
 *                 type: integer
 *                 example: 2
 *               bathrooms:
 *                 type: integer
 *                 example: 2
 *               size:
 *                 type: integer
 *                 example: 1200
 *               yearBuilt:
 *                 type: integer
 *                 example: 2020
 *               rentAmount:
 *                 type: number
 *                 example: 2500
 *               rentCycle:
 *                 type: string
 *                 enum: [MONTHLY, QUARTERLY, YEARLY]
 *                 example: "MONTHLY"
 *               securityDeposit:
 *                 type: number
 *                 example: 5000
 *               availableDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-11-01T00:00:00Z"
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Parking", "Gym", "Pool"]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *     responses:
 *       201:
 *         description: Listing created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Listing created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Listing'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Title must be at least 3 characters"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid or expired token"
 */
router.post("/", authenticate, authorize("LANDLORD"), createListing);

export default router;
