import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { Team } from "../../models/teamModel/teams.model";
import { TeamPlayer } from "../../models/teamModel/teamPlayer.model";
import { ApiResponse } from "../../utils/ApiResponse";

export const makeCaptain = asyncHandler(async (req, res) => {
  // auth check for team manager
  const creator = (req as any).user;
  if (!creator || creator.role !== "manager") {
    throw new ApiError(401, "Unauthorized request, please login as a team manager");
  }
  // get teamId and playerId from request params and body
  const { teamId } = req.params;
  const { playerId } = req.body;
  // check if teamId and playerId are valid
  if (
    !mongoose.isValidObjectId(teamId) ||
    !mongoose.isValidObjectId(playerId)
  ) {
    throw new ApiError(400, "valid teamId and playerId are required");
  }

  // find the team
  const team = await Team.findById(teamId);

  // check if team exists
  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  // check if the creator is the manager of the team
  if ( team.managerId.toString() !== creator._id.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to make changes to this team"
    );
  }

  // check if the player is in the team
  const player = await TeamPlayer.findOne({ playerId, teamId }).populate({
    path: "playerId",
    select: "name"
  })

  if (!player) {
    throw new ApiError(404, "Player not found in the team");
  }

  // make sure player is active
  if (player.status !== "active") {
    throw new ApiError(400, "Player is not active in the team");
  }

  // if player already a captain, return error
  if (player.isCaptain) {
    throw new ApiError(400, "Player is already a captain");
  }

  // find the current captain
  const currentCaptain = await TeamPlayer.findOne({
    teamId,
    isCaptain: true,
  });

  // if current captain exists, make him a player
  if(currentCaptain) {
    currentCaptain.isCaptain = false;
    await currentCaptain.save();
  }

  // make player the new captain
  player.isCaptain = true;
  await player.save();

  // return success message
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { newCaptain: {
            playerId: player.playerId,
           
        } },
        "Player is now the captain of the team"
      )
    );
});
