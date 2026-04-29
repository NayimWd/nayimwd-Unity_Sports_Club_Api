import mongoose from "mongoose";
import { asyncHandler } from "../../../utils/asyncHandler";
import { ApiError } from "../../../utils/ApiError";
import { Team } from "../../../models/teamModel/teams.model";
import { TeamPlayer } from "../../../models/teamModel/teamPlayer.model";
import { PlayerProfile } from "../../../models/profilesModel/playerProfile.model";
import { ApiResponse } from "../../../utils/ApiResponse";

export const removePlayers = asyncHandler(async (req, res) => {
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
      // 1. Validate team + ownership 
      const team = await Team.findOne({
        _id: teamId,
        managerId: user._id,
      })
        .select("_id")
        .session(session)
        .lean();

      if (!team) {
        throw new ApiError(403, "Not authorized or team not found");
      }

      // 2. Delete relation 
      const deletion = await TeamPlayer.deleteOne(
        { teamId, playerId },
        { session }
      );

      if (deletion.deletedCount === 0) {
        throw new ApiError(404, "Player not found in the team");
      }

      // 3. Update profile + decrement count 
      await Promise.all([
        PlayerProfile.updateOne(
          { userId: playerId },
          { $unset: { teamId: 1 } },
          { session }
        ),
        Team.updateOne(
          { _id: teamId, playerCount: { $gt: 0 } },
          { $inc: { playerCount: -1 } },
          { session }
        ),
      ]);
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {},
        `Player ${playerId} removed from team successfully`
      )
    );
  } finally {
    session.endSession();
  }
});
