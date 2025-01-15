import { Venue } from "../../models/venueModel/venue.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { uploadOnCloudinary } from "../../utils/cloudinary";

export const createVenue = asyncHandler(async (req, res) => {
  // auth check for admin or staff
  const creator = (req as any).user;
  if (!creator) {
    throw new ApiError(401, "Unauthorized request, please login");
  }

  // check if user is admin or staff
  if (creator.role !== "admin" && creator.role !== "staff") {
    throw new ApiError(
      403,
      "Unauthorized request, you are not allowed to create venue"
    );
  }

  // get data from request body
  const { name, city, location, features } = req.body;

  // validate data
  if (!name || !city || !location || !features) {
    throw new ApiError(400, "Please provide all required fields");
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
    throw new ApiError(400, "Upload venue photo failed");
  }

  // create venue
  const venue = await Venue.create({
    name,
    city,
    location,
    features,
    photo: photo.url,
  });

  if (!venue) {
    throw new ApiError(500, "Something went wrong while creating venue");
  }

  // send response
  res
    .status(201)
    .json(new ApiResponse(201, venue, "Venue created successfully"));
});
