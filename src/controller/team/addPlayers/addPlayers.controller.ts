import mongoose from "mongoose";
import { ApiError } from "../../../utils/ApiError";
import { asyncHandler } from "../../../utils/asyncHandler";
import { Team } from "../../../models/teamModel/teams.model";
import { TeamPlayer } from "../../../models/teamModel/teamPlayer.model";
import { PlayerProfile } from "../../../models/profilesModel/playerProfile.model";
import { ApiResponse } from "../../../utils/ApiResponse";


export const addPlayers = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const managerId = (req as any).user._id;
      const { teamId } = req.params;
      const { playerId } = req.body;

      if (!teamId || !playerId) {
        throw new ApiError(400, "TeamId and playerId are required");
      }

      // 1. fetch team 
      const team = await Team.findById(teamId).session(session);

      if (!team) {
        throw new ApiError(404, "Team not found");
      }

      // 2. authorization check
      if (team.managerId.toString() !== managerId.toString()) {
        throw new ApiError(403, "Not authorized to modify this team");
      }

      // 3. capacity check (fail fast)
      if (team.playerCount >= 18) {
        throw new ApiError(400, "Team already has maximum players");
      }

      // 4. validate player by profile 
      const profile = await PlayerProfile.findOne({
        userId: playerId,
      }).session(session);

      if (!profile) {
        throw new ApiError(400, "Player profile not completed");
      }

      // 5. checking player is not already in a team
      if (profile.teamId) {
        throw new ApiError(400, "Player already assigned to a team");
      }

      // 6. stop duplicate relation
      const exists = await TeamPlayer.exists({
        playerId,
      }).session(session);

      if (exists) {
        throw new ApiError(400, "Player already exists in a team");
      }

      // 7. create team-player relation
      await TeamPlayer.create(
        [{ teamId, playerId }],
        { session }
      );

      // 8. update profile 
      profile.teamId = team._id;
      await profile.save({ session });

      // 9.  increment team player count
      await Team.updateOne(
        { _id: teamId },
        { $inc: { playerCount: 1 } },
        { session }
      );
    });

    res
      .status(200)
      .json(new ApiResponse(200, {}, "Player added successfully"));
  } catch (error) {
    throw error;
  } finally {
    session.endSession();
  }
});
