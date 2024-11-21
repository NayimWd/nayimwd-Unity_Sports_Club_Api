import { Team } from "../../models/teamModel/teams.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { uploadOnCloudinary } from "../../utils/cloudinary";

export const createTeam = asyncHandler(async (req, res) => {
  const user = (req as any).user;
  if (!user) {
    throw new ApiError(400, "Invalid Token, User not found");
  }
  // authorize manager to create team
  if (user.role !== "manager") {
    throw new ApiError(401, "Only manager can create team");
  }
  // get team name from req body
  const { teamName } = req.body;

  // Check for duplicate team name
  const existingTeam = await Team.findOne({ teamName, managerId: user._id });
  if (existingTeam) {
    throw new ApiError(409, "You already have a team with this name");
  }

  // Access avatar file (special for ts)
  const logoLocalPath = req.file?.path;
  // validate
  if (!logoLocalPath) {
    throw new ApiError(400, "Team Logo is required");
  }

  //  upload logo on cloudinary
  const logo = await uploadOnCloudinary(logoLocalPath);

  // validate logo
  if (!logo) {
    throw new ApiError(400, "Upload team logo failed");
  }

  const team = await Team.create({
    teamName,
    managerId: user._id,
    teamLogo: logo.url,
  });

  if (!team) {
    throw new ApiError(500, "Something went wrong while creating team");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, team, "Team Created Successfully"));
});
