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
    const user = (req as any).user;
    const { teamId } = req.params;
    const { playerId } = req.body;

    if (!user?._id) {
      throw new ApiError(401, "Unauthorized");
    }

    if (
      !mongoose.isValidObjectId(teamId) ||
      !mongoose.isValidObjectId(playerId)
    ) {
      throw new ApiError(400, "Invalid teamId or playerId");
    }

    await session.withTransaction(async () => {
      // 1. Validate team + ownership + capacity 
      const team = await Team.findOne({
        _id: teamId,
        managerId: user._id,
      })
        .select("playerCount")
        .session(session)
        .lean();

      if (!team) {
        throw new ApiError(403, "Not authorized or team not found");
      }

      if (team.playerCount >= 18) {
        throw new ApiError(400, "Team is full");
      }

      // 2. Validate player profile 
      const profile = await PlayerProfile.findOne({
        userId: playerId,
      })
        .select("teamId")
        .session(session)
        .lean();

      if (!profile) {
        throw new ApiError(400, "Player profile not completed");
      }

      if (profile.teamId) {
        throw new ApiError(400, "Player already assigned to a team");
      }

      // 3. Create relation 
      try {
        await TeamPlayer.create([{ teamId, playerId }], { session });
      } catch (err: any) {
        if (err.code === 11000) {
          throw new ApiError(400, "Player already exists in a team");
        }
        throw err;
      }

      // 4. Update profile + increment count 
      await Promise.all([
        PlayerProfile.updateOne(
          { userId: playerId },
          { $set: { teamId } },
          { session }
        ),
        Team.updateOne(
          { _id: teamId },
          { $inc: { playerCount: 1 } },
          { session }
        ),
      ]);
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Player added successfully"));
  } finally {
    session.endSession();
  }
});
