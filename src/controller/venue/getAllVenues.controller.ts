import { Venue } from "../../models/venueModel/venue.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const getAllVenues = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  // Parse pagination parameters
  const skip = (Number(page) - 1) * Number(limit);

  // get all venues
  const venues = await Venue.find()
    .select("-__v -createdAt -updatedAt -features -location")
    .skip(skip)
    .limit(Number(limit))
    .lean();

  // check if no venue found
  if (!venues || venues.length === 0) {
    throw new ApiError(404, "No venue found");
  }

  // get total number of venues
  const length = await Venue.countDocuments();

  // send response
  res
    .status(200)
    .json(new ApiResponse(200, {
        total: length,    
        venues
    }, "All venues fetched successfully"));
});

export const venueDetails = asyncHandler(async (req, res) => {
  // get venue id from request params
  const {  venueId } = req.params;
  // validate id
  if (!venueId) {
    throw new ApiError(400, "Invalid venue ID");
  }

  // get venue details
  const venue = await Venue.findById(venueId).select("-__v -createdAt -updatedAt");

  if (!venue) {
    throw new ApiError(404, "Venue not found with this id");
  }

  

  // send response
  res
    .status(200)
    .json(new ApiResponse(200,venue, "Venue details fetched successfully"));
});
