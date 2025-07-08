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

  // get total number of venues
  const length = await Venue.countDocuments();

  // send response
  res.status(200).json(
    new ApiResponse(
      200,
      {
        total: length,
        venues: venues || null,
      },
      venues ? "All venues fetched successfully" : "No Venue exists"
    )
  );
});

export const venueDetails = asyncHandler(async (req, res) => {
  // get venue id from request params
  const { venueId } = req.params;
  // validate id
  if (!venueId) {
    throw new ApiError(400, "Invalid venue ID");
  }

  // get venue details
  const venue = await Venue.findById(venueId).select(
    "-__v -createdAt -updatedAt"
  );


  // send response
  res
    .status(200)
    .json(new ApiResponse(200, venue, "Venue details fetched successfully"));
});
