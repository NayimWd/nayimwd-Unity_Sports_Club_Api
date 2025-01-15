import { Venue } from "../../models/venueModel/venue.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const deleteVenue = asyncHandler(async (req, res) => {
    // auth check for admin or staff
    const creator = (req as any).user;
    if (!creator) {
        throw new ApiError(401, "Unauthorized request, please login");
    }
    // check if user is admin or staff
    if (creator.role !== "admin" && creator.role !== "staff") {
        throw new ApiError(
            403,
            "Unauthorized request, you are not allowed to delete venue"
        );
    }

    // get data from request body and params
    const { venueId } = req.params;

    // validate data
    if (!venueId) {
        throw new ApiError(400, "valid venue ID is required");
    }

    // delete venue
    const venue = await Venue.findByIdAndDelete(venueId);

    if (!venue) {
        throw new ApiError(500, "Something went wrong while deleting venue");
    }

    // send response
    res
        .status(200)
        .json(new ApiResponse(200, null, "Venue deleted successfully"));
});