import mongoose from "mongoose";
import { Venue } from "../../models/venueModel/venue.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { uploadOnCloudinary } from "../../utils/cloudinary";

export const updateVenueDetails = asyncHandler(async (req, res) => {
  // auth check for admin or staff
  const creator = (req as any).user;
  if (!creator) {
    throw new ApiError(401, "Unauthorized request, please login");
  }
  // check if user is admin or staff
  if (creator.role !== "admin" && creator.role !== "staff") {
    throw new ApiError(
      403,
      "Unauthorized request, you are not allowed to update venue"
    );
  }

  // get data from request body and params
  const { venueId } = req.params;
  const { name, city, location, features } = req.body;

  // validate data
  if (!venueId) {
    throw new ApiError(400, "valid venue ID is required");
  }

  if (!mongoose.isValidObjectId(venueId)) {
    throw new ApiError(400, "Invalid venue ID");
  }

  // update venue
  const venue = await Venue.findByIdAndUpdate(
    venueId,
    {
      name,
      city,
      location,
      features,
    },
    { new: true }
  );

  if (!venue) {
    throw new ApiError(500, "Something went wrong while updating venue");
  }

  // send response
  res
    .status(200)
    .json(new ApiResponse(200, venue, "Venue updated successfully"));
});

export const updateVenuePhoto = asyncHandler(async (req, res) => {
  // auth check for admin or staff
  const creator = (req as any).user;
  if (!creator) {
    throw new ApiError(401, "Unauthorized request, please login");
  }
  // check if user is admin or staff
  if (creator.role !== "admin" && creator.role !== "staff") {
    throw new ApiError(
      403,
      "Unauthorized request, you are not allowed to update venue"
    );
  }

  // get data from request body and params
  const { venueId } = req.params;

  // validate data
  if (!venueId) {
    throw new ApiError(400, "valid venue ID is required");
  }

  if (!mongoose.isValidObjectId(venueId)) {
    throw new ApiError(400, "Invalid venue ID");
  }

  // get photo from multer
  const photoLocalPath = req.file?.path;
  // validate
  if (!photoLocalPath) {
    throw new ApiError(400, "Venue photo is required");
  }
  // upload photo on cloudinary
  const photo = await uploadOnCloudinary(photoLocalPath);
  // validate photo
  if (!photo) {
    throw new ApiError(400, "Update venue photo failed");
  }

  // update venue
  const venue = await Venue.findByIdAndUpdate(
    venueId,
    {
      photo: photo.url,
    },
    { new: true }
  );

  if (!venue) {
    throw new ApiError(500, "Something went wrong while updating venue");
  }

  // send response
  res
    .status(200)
    .json(new ApiResponse(200, venue, "Venue updated successfully"));
});
