import mongoose from "mongoose";
import { ApiError } from "../../../utils/ApiError";
import { asyncHandler } from "../../../utils/asyncHandler";
import { Team } from "../../../models/teamModel/teams.model";
import { User } from "../../../models/userModel/user.model";
import { TeamPlayer } from "../../../models/teamModel/teamPlayer.model";
import { PlayerProfile } from "../../../models/profilesModel/playerProfile.model";
import { ApiResponse } from "../../../utils/ApiResponse";

export const addPlayers = asyncHandler(async (req, res) => {
  // starting mongodb session
  const session = await mongoose.startSession();
  session.startTransaction();

  // working on adding player by manager
  try {
    // get manager ID from auth token
    const managerId = (req as any).user._id;
    if (!managerId) {
      throw new ApiError(400, "Invalid token, user not found");
    }

    // validate request payload
    const { teamId, players } = req.body;

    // validate team by team id
    const team = await Team.findById(teamId);
    if (!team) {
      throw new ApiError(404, "Team not found by this ID");
    }
    // validate manager authority
    if (team.managerId.toString() !== managerId.toString()) {
      throw new ApiError(
        403,
        "You are not authorized to add players to this team"
      );
    }
    // validate players array
    if (!teamId || !Array.isArray(players) || players.length === 0) {
      throw new ApiError(400, "Team ID and list of player IDs are required");
    }

    if (players.length > 15) {
      throw new ApiError(400, "Can not add more that 15 Players at once");
    }

    // prevent adding players if more that 18
    if (team.playerCount + players.length > 18) {
      throw new ApiError(400, "You can not add players more that 18");
    }

    // initialize response array
    const addedPlayers: string[] = [];
    const skippedPlayers: string[] = [];

    // array for handle player profile
    const allPlayerProfiles = [];

    // process each player
    for (const playerId of players) {
      // fetch player details for add or reject
      const player = await User.findById(playerId);
      // reject players if not a player or not exist
      if (!player || player.role !== "player") {
        skippedPlayers.push(playerId);
        continue;
      }

      // check if player already exist on the team
      const existingPlayer = await TeamPlayer.findOne({ playerId });
      if (existingPlayer) {
        skippedPlayers.push(playerId);
        continue;
      }

      // Add player to the team
      await TeamPlayer.create(
        [
          {
            teamId,
            playerId,
          },
        ],
        {
          session,
        }
      );

      // Create or Update player profile with team id
      // bulk operation for update profile
      allPlayerProfiles.push({
        updateOne: {
          filter: { userId: playerId },
          update: { teamId },
          upsert: true,
        },
      });

      // add valid players to addedPlayers array
      addedPlayers.push(playerId);
    }

    // create player profile with teamId and player's userId if does not exist
    if (allPlayerProfiles.length > 0) {
      await PlayerProfile.bulkWrite(allPlayerProfiles, { session });
    }

    // update team player count
    team.playerCount += addedPlayers.length;
    await team.save({ session });

    // commit transaction
    await session.commitTransaction();

    session.endSession();

    // return response
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Players processed successfully"));
  } catch (error) {
    // rollback transaction if any error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});
