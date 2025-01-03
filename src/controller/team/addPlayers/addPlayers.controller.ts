import mongoose from "mongoose";
import { ApiError } from "../../../utils/ApiError";
import { asyncHandler } from "../../../utils/asyncHandler";
import { Team } from "../../../models/teamModel/teams.model";
import { TeamPlayer } from "../../../models/teamModel/teamPlayer.model";
import { PlayerProfile } from "../../../models/profilesModel/playerProfile.model";
import { ApiResponse } from "../../../utils/ApiResponse";
import { User } from "../../../models/userModel/user.model";

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
    const { teamId, playerId } = req.body;

    // validate players array
    if (!teamId || !playerId) {
      throw new ApiError(400, "TeamId and player ID both are required");
    }

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

    // prevent adding players if more that 18
    if (team.playerCount >= 18) {
      throw new ApiError(400, "You can not add players more that 18");
    }

    // validate player
    const player = await User.findOne({ _id: playerId, role: "player" });
    if (!player) {
      throw new ApiError(404, "Player not found or not a valid player");
    }

    // check if player alaready exist on team
    const existingPlayer = await TeamPlayer.findOne({ playerId });

    if (existingPlayer) {
      throw new ApiError(400, "Player already exist in another team");
    }

    // add player to the team
    const teamPlayer = new TeamPlayer({ teamId, playerId });
    await teamPlayer.save({ session });

    // update or create new team player profile
    await PlayerProfile.updateOne(
      { userId: playerId },
      { teamId },
      { upsert: true, session }
    );

    // update team player count
    team.playerCount += 1;
    await team.save({ session });

    // commit transaction
    await session.commitTransaction();
    session.endSession();

    // Return success response
    res.status(200).json(new ApiResponse(200, {}, "Player added successfully"));
  } catch (error) {
    // Rollback transaction
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});
