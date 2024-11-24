import { Team } from "../../models/teamModel/teams.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { uploadOnCloudinary } from "../../utils/cloudinary";

export const updateTeamName = asyncHandler(async (req, res) => {
  const userId = (req as any).user._id;

  if (!userId) {
    throw new ApiError(400, "Invalid Token, User not found");
  }

  // Get team ID and team name
  const { teamId } = req.params;
  const { teamName } = req.body;

  if (!teamId) {
    throw new ApiError(400, "Team ID is required");
  }

  if (!teamName) {
    throw new ApiError(400, "Team Name is required");
  }

  // Check if the team exists under the user's management
  const existingTeam = await Team.findOne({ _id: teamId, managerId: userId });
  if (!existingTeam) {
    throw new ApiError(
      404,
      "Team does not exist or you do not have access to it"
    );
  }

  // Update team name
  const updatedTeam = await Team.findByIdAndUpdate(
    teamId,
    { teamName },
    { new: true } // Return the updated document
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTeam, "Team Name updated successfully"));
});

// update team logo
export const updateTeamLogo = asyncHandler(async (req, res) => {
  const userId = (req as any).user._id;
  if (!userId) {
    throw new ApiError(400, "Invalid Token, User not found");
  }

  // Get team ID
  const { teamId } = req.params;

  if (!teamId) {
    throw new ApiError(400, "Team ID is required");
  }

  const existingTeam = await Team.findOne({ _id: teamId, managerId: userId });

  if (!existingTeam) {
    throw new ApiError(
      404,
      "Team does not exist or you do not have access to it"
    );
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
  if (!logo || !logo.url) {
    throw new ApiError(400, "Upload team logo failed");
  }

  await Team.findByIdAndUpdate(
    teamId,
    {
      teamLogo: logo.url,
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Team Logo updated successfully"));
});
