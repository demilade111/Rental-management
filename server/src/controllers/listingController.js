import { createListingSchema } from "../validations/listingValidation.js";
import {
  createListings,
  getAllListings,
  getListingById,
  deleteListingById,
  updateListingById,
  addAmenityToListing,
  removeAmenityFromListing,
} from "../services/listingService.js";
import { CreatedResponse, SuccessResponse, HandleError } from "../utils/httpResponse.js";

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
    const listings = await getAllListings();
    return SuccessResponse(res, 200, "Listings fetched successfully", listings);
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

// Exporting the controller functions for Add and Remove Amenity
async function addListingAmenity(req, res) {
  try {
    const { listingId} = req.params;
    const { name } = req.body;
    const amenity = await addAmenityToListing(listingId, name);

    return CreatedResponse(res, "Amenity added successfully", amenity);
  } catch (error) {
    return HandleError(res, error);
  }
}

async function deleteListingAmenity(req, res) {
  try {
    const { amenityId } = req.params;

    const result = await removeAmenityFromListing(amenityId);

    return SuccessResponse(res, 200, result.message);
  } catch (error) {
    return HandleError(res, error);
  }
}

export { createListing, fetchAllListings, fetchListingById, deleteListing, updateListing, addListingAmenity, deleteListingAmenity };
