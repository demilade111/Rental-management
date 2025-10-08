import { createListingSchema } from "../validations/listingValidation.js";
import { createListings } from "../services/listingService.js";

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

export { createListing };
