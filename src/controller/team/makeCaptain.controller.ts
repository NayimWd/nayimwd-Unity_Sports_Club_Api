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
    throw new ApiError(
      401,
      "Unauthorized request, please login as a team manager"
    );
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
  const team = await Team.findOne({
    _id: teamId,
    managerId: creator._id,
  })
    .select("_id")
    .lean();

  if (!team) {
    throw new ApiError(403, "Not authorized or team not found");
  }

  // check if the player is in the team and active
  const player = await TeamPlayer.findOne({
    playerId,
    teamId,
    status: "active",
  })
    .populate({
      path: "playerId",
      select: "name",
    })
    .lean();

  if (!player) {
    throw new ApiError(404, "Active player not found in team");
  }

  // if player already a captain, return error
  if (player.isCaptain) {
    throw new ApiError(400, "Player is already a captain");
  }

  // remove old captain and add new

  // remove existing captain (only active ones, safer)
  await TeamPlayer.updateOne(
    { teamId, isCaptain: true },
    { $set: { isCaptain: false } }
  ),
    // set new captain using playerId (User._id)
    await TeamPlayer.updateOne(
      { teamId, playerId },
      { $set: { isCaptain: true } }
    ),
    // return success message
    res.status(200).json(
      new ApiResponse(
        200,
        {
          newCaptain: {
            playerId: player.playerId,
          },
        },
        "Player is now the captain of the team"
      )
    );
});
