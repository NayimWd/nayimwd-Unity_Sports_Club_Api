import { Team } from "../../models/teamModel/teams.model";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { PlayerProfile } from "../../models/profilesModel/playerProfile.model";
import { ApiResponse } from "../../utils/ApiResponse";
import { TeamPlayer } from "../../models/teamModel/teamPlayer.model";

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
  .lean();

  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  // fetch team players profiles
  const playersProfiles = await PlayerProfile.find({ teamId })
    .select("userId, player_role batingStyle bowlingArm bowlingStyle")
    .populate({
      path: "userId",
      model: "User", 
      select: "name photo"
    }).lean();


  // fetch team captain 
  const captain = await TeamPlayer.findOne({ teamId, isCaptain: true})
  .populate({
    path: "playerId",
    model: "User", 
    select: "name photo playerId"
  }).lean();

  // prepare response
  const response = {
    manager: team.managerId || null,
    captain: captain || null,
    players: playersProfiles.map((player) => player) || null,
  };

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, response, "Team profiles found successfully"));
});
