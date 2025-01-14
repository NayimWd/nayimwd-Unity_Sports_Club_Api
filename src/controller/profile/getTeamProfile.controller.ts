import { Team } from "../../models/teamModel/teams.model";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { PlayerProfile } from "../../models/profilesModel/playerProfile.model";
import { ApiResponse } from "../../utils/ApiResponse";

export const getTeamProfiles = asyncHandler(async (req, res) => {
  // get team ID from request params
  const { teamId } = req.params;

  // validate team ID
  if (!teamId) {
    throw new ApiError(400, "Team ID is required");
  }

  // check if team exists with the given ID
  const existingTeam = await Team.findById(teamId);
  // validate
  if (!existingTeam) {
    throw new ApiError(404, "Team not found");
  }

  // Fetch team with manager's basic details
  const team = await Team.findById(teamId)
  .populate("managerId", "name photo")
  .populate("");

  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  // fetch team players profiles
  const playersProfiles = await PlayerProfile.find({ teamId })
    .select("userId")
    .populate({
      path: "userId",
      select: "name photo",
    });

  if (!playersProfiles) {
    throw new ApiError(404, "Players profiles not found");
  }

  // prepare response
  const response = {
    manager: team.managerId,
    players: playersProfiles.map((player) => player),
  };

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, response, "Team profiles found successfully"));
});
