import mongoose from "mongoose";
import { asyncHandler } from "../../../utils/asyncHandler";
import { ApiError } from "../../../utils/ApiError";
import { verify } from "crypto";
import { Team } from "../../../models/teamModel/teams.model";
import { TeamPlayer } from "../../../models/teamModel/teamPlayer.model";
import { PlayerProfile } from "../../../models/profilesModel/playerProfile.model";
import { ApiResponse } from "../../../utils/ApiResponse";

export const removePlayers = asyncHandler(async (req, res) => {
  // starting mongodb session
  const session = await mongoose.startSession();
  session.startTransaction();

  //start operation
  try {
    // verify manager from token
    const managerId = (req as any).user._id;
    if (!managerId) {
      throw new ApiError(400, "Invalid Token, User not found");
    }
    // get team and player ID from req body
    const { teamId, playerId } = req.body;
    // validate
    if (!teamId || !playerId) {
      throw new ApiError(400, "Team ID and Player ID both are required");
    }

    // verify if team exist or not
    const team = await Team.findById(teamId);
    if (!team) {
      throw new ApiError(400, "Team not found");
    }

    // verfy manager authority
    if (team.managerId.toString() !== managerId.toString()) {
      throw new ApiError(
        400,
        "You are not authorized to remove players from this team"
      );
    }

    // check if the player exist in the team
    const teamPlayer = await TeamPlayer.findOne({ teamId, playerId });
    if (!teamPlayer) {
      throw new ApiError(404, "Player not found in the team");
    }

    // remove player from TeamPlayer collection
    await TeamPlayer.deleteOne({ teamId, playerId }, { session });

    // Remove Team ID from players profile
    await PlayerProfile.updateOne(
      { userId: playerId },
      { $unset: { teamId: 1 } },
      { session }
    );

    // Update team player count
    team.playerCount -= 1;
    await team.save({ session });

    // Commit and end transaction
    await session.commitTransaction();
    session.endSession();

    // response
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          `Player ${playerId} removed from team successfully`
        )
      );
  } catch (error) {
    // Rollback transaction if failed
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});
