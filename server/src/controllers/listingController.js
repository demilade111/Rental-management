import { createListingSchema } from "../validations/listingValidation.js";
import {
  createListings,
  getAllListings,
  getListingById,
  deleteListingById,
  updateListingById,
  checkListingHasLeases,
} from "../services/listingService.js";
import {
  CreatedResponse,
  SuccessResponse,
  HandleError,
} from "../utils/httpResponse.js";

async function createListing(req, res) {
  try {
    const body = createListingSchema.parse(req.body);
    const userId = req.user.id;
    const listing = await createListings(userId, body);

    return CreatedResponse(res, "Listing created successfully", listing);
  } catch (error) {
    return HandleError(res, error);
  }
}

async function fetchAllListings(req, res) {
  try {
    const landlordId = req.user?.id; // from JWT decoded payload or session

    if (!landlordId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: landlord not found",
      });
    }

    const listings = await getAllListings(landlordId);

    const response = {
      success: true,
      message: "Listings fetched successfully",
      timestamp: new Date().toISOString(),
      listing: listings,
    };

    return res.status(200).json(response);
  } catch (error) {
    return HandleError(res, error);
  }
}

async function fetchListingById(req, res) {
  try {
    const { id } = req.params;
    const listing = await getListingById(id);
    return SuccessResponse(res, 200, "Listing fetched successfully", listing);
  } catch (error) {
    return HandleError(res, error);
  }
}

async function deleteListing(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await deleteListingById(id, userId);

    return SuccessResponse(res, 200, result.message);
  } catch (error) {
    return HandleError(res, error);
  }
}

async function updateListing(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user.id;
    const updatedListing = await updateListingById(id, userId, updates);

    return SuccessResponse(
      res,
      200,
      "Listing updated successfully",
      updatedListing
    );
  } catch (error) {
    return HandleError(res, error);
  }
}

async function checkListingLeasesController(req, res) {
  try {
    const { id } = req.params;
    const result = await checkListingHasLeases(id);
    return SuccessResponse(res, 200, "Lease check successful", result);
  } catch (error) {
    return HandleError(res, error);
  }
}

export {
  createListing,
  fetchAllListings,
  fetchListingById,
  deleteListing,
  updateListing,
  checkListingLeasesController
};
