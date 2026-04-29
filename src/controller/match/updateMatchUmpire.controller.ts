import { Match } from "../../models/matchModel/match.model";
import { User } from "../../models/userModel/user.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import mongoose from "mongoose";

export const updateUmpire = asyncHandler(async (req, res) => {
  // authorize user
  const author = (req as any).user;

  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to update match status");
  }

  // extract params
  const { tournamentId, matchId } = req.params;
  const { umpireIds } = req.body;

  if (!tournamentId || !matchId || !Array.isArray(umpireIds)) {
    throw new ApiError(
      400,
      "Please provide tournament ID, match ID and umpires"
    );
  }

  // validate umpire count
  if (umpireIds.length < 2 || umpireIds.length > 3) {
    throw new ApiError(400, "Please provide two or three umpires");
  }

  // validate duplicates
  const normalizedIds = umpireIds.map(String);
  const uniqueIds = [...new Set(normalizedIds)];

  if (uniqueIds.length !== umpireIds.length) {
    throw new ApiError(400, "Duplicate umpires are not allowed");
  }

  const session = await mongoose.startSession();

  try {
    let responseData: any;

    await session.withTransaction(
      async () => {
        /**
         match and umpire validation
         */
        const [match, validUmpiresCount] = await Promise.all([
          Match.findOne({
            _id: matchId,
            tournamentId,
          })
            .select("status")
            .lean()
            .session(session),

          User.countDocuments({
            _id: { $in: uniqueIds },
            role: "umpire",
          }).session(session),
        ]);

        // validate match
        if (!match) {
          throw new ApiError(404, "Match not found");
        }

        // block update after match started
        if (["in-progress", "completed", "cancelled"].includes(match.status)) {
          throw new ApiError(
            400,
            "Cannot update umpires for completed or cancelled matches"
          );
        }

        // validate umpires exist
        if (validUmpiresCount !== uniqueIds.length) {
          throw new ApiError(404, "One or more umpires not exist");
        }

        const umpires = {
          firstUmpire: uniqueIds[0],
          secondUmpire: uniqueIds[1],
          thirdUmpire: uniqueIds[2] || null,
        };

        //  update with status recheck
        const updateResult = await Match.updateOne(
          {
            _id: matchId,
            tournamentId,
            status: { $nin: ["in-progress", "completed", "cancelled"] },
          },
          {
            $set: { umpires },
          },
          { session }
        );

        if (updateResult.matchedCount === 0) {
          throw new ApiError(
            409,
            "Match state changed during update. Please try again"
          );
        }

        responseData = { umpires };
      },
      {
        readConcern: { level: "snapshot" },
        writeConcern: { w: "majority" },
      }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, responseData, "Umpires updated successfully"));
  } catch (error) {
    // transaction auto-aborts on thrown error
    throw error;
  } finally {
    await session.endSession();
  }
});
