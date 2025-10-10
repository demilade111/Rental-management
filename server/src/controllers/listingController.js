import { createListingSchema } from "../validations/listingValidation.js";
import {
  createListings,
  getAllListings,
  getListingById,
} from "../services/listingService.js";

async function createListing(req, res, next) {
  try {
    const body = createListingSchema.parse(req.body);
    const userId = req.user.id;
    const listing = await createListings(userId, body);

    res.status(201).json({
      success: true,
      message: "Listing created successfully",
      data: listing,
    });
  } catch (err) {
    next(err);
  }
}

async function fetchAllListings(req, res, next) {
  try {
    const listings = await getAllListings();
    res.status(200).json({
      success: true,
      message: "Listings fetched successfully",
      data: listings,
    });
  } catch (err) {
    next(err);
  }
}
async function fetchListingById(req, res, next) {
  try {
    const { id } = req.params;
    const listing = await getListingById(id);
    res.status(200).json({
      success: true,
      message: "Listing fetched successfully",
      data: listing,
    });
  } catch (err) {
    next(err);
  }
}

export { createListing, fetchAllListings, fetchListingById };
