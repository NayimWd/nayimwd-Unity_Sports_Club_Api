import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { uploadOnCloudinary } from "../../utils/cloudinary";

export const createTournament = asyncHandler(async (req, res) => {
  // auth check for admin or staff
  const creator = (req as any).user;
  if (!creator) {
    throw new ApiError(401, "Unauthorized request, please login");
  }
  // check if user is admin or staff
  if (!["admin", "staff"].includes(creator.role)) {
    throw new ApiError(
      403,
      "Unauthorized request, you are not allowed to create tournament"
    );
  }

  // get data from request body
  const {
    tournamentName,
    tournamentType,
    description,
    format,
    ballType,
    matchOver,
    registrationDeadline,
    startDate,
    endDate,
    status="upcoming",
    entryFee,
    champion,
    runnerUp,
    thirdPlace,
  } = req.body;

  // validate data
  if (
    !tournamentName ||
    !tournamentType ||
    !description ||
    !format ||
    !ballType ||
    !matchOver ||
    !registrationDeadline ||
    !startDate ||
    !endDate ||
    !status ||
    !entryFee ||
    !champion ||
    !runnerUp
  ) {
    throw new ApiError(400, "Missing required fields");
  }

  // date validation
  const regDate = new Date(registrationDeadline.split("-").reverse().join("-"));
  const start = new Date(startDate.split("-").reverse().join("-"));
  const end = new Date(endDate.split("-").reverse().join("-"));

  if (
    isNaN(regDate.getTime()) ||
    isNaN(start.getTime()) ||
    isNaN(end.getTime())
  ) {
    throw new ApiError(400, "Invalid date format");
  }

  if (start <= regDate) {
    throw new ApiError(400, "Start date must be after registration deadline");
  }

  if (end <= start) {
    throw new ApiError(400, "End date must be after start date");
  }

  // get photo from request file
  const photoLocalPath = req.file?.path;

  if (!photoLocalPath) {
    throw new ApiError(400, "Photo is required");
  }

  // upload photo to cloudinary
  const photo = await uploadOnCloudinary(photoLocalPath);
  if (!photo) {
    throw new ApiError(400, "Upload photo failed");
  }

  // create tournament
  const tournament = await Tournament.create({
    tournamentName,
    tournamentType,
    description,
    format,
    ballType,
    matchOver,
    registrationDeadline,
    startDate,
    endDate,
    seat: format,
    teamCount: 0,
    status,
    entryFee,
    champion,
    runnerUp,
    thirdPlace,
    photo: photo.url,
  });

  if (!tournament) {
    throw new ApiError(500, "Something went wrong while creating tournament");
  }

  // send response
  return res
    .status(201)
    .json(new ApiResponse(201, tournament, "Tournament created successfully"));
});
