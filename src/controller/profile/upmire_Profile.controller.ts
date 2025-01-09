import { UmpireProfile } from "../../models/profilesModel/umpireProfile.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const createUmpireProfile = asyncHandler(async (req, res) => {
  const umpire = (req as any).user;

  if (!umpire || !umpire._id) {
    throw new ApiError(400, "Invalid token, user not found");
  }

  if (umpire.role !== "umpire") {
    throw new ApiError(403, "User role is not umpire");
  }

  // check existing profile
  const existingProfile = await UmpireProfile.findOne({ userId: umpire._id });

  if (existingProfile) {
    throw new ApiError(409, "Profile already exists");
  }
  // get data from req body
  const { experience } = req.body;
  // validate
  if(!experience){
    throw new ApiError(400, "Experience field is missing");
  }
  // create profile
  const profile = await UmpireProfile.create({
    userId: umpire._id,
    yearsOfExperience: experience,
  });

  if (!profile) {
    throw new ApiError(400, "Something went wrong creating profile");
  }

  // return response
  return res
    .status(201)
    .json(new ApiResponse(200, profile, "Umpire profile successfully created"));
});
