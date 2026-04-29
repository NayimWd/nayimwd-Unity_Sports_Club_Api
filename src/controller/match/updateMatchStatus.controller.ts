import mongoose from "mongoose";
import { Match } from "../../models/matchModel/match.model";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

// Allowed status transitions
const validStatusTransitions: Record<string, string[]> = {
  scheduled: ["in-progress", "cancelled"],
  "in-progress": ["completed", "cancelled"],
  completed: [],
};

export const updateMatchStatus = asyncHandler(async (req, res) => {
  // authenticate user
  const author = (req as any).user;

  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to update match status");
  }

  // extract request data
  const { tournamentId, matchId } = req.params;
  const { newStatus } = req.body;

  // validate inputs
  if (!tournamentId || !matchId || !newStatus) {
    throw new ApiError(
      400,
      "Please provide tournament ID, match ID and status"
    );
  }

  if (
    !["scheduled", "in-progress", "completed", "cancelled"].includes(newStatus)
  ) {
    throw new ApiError(400, "Invalid status provided");
  }

  const session = await mongoose.startSession();

  try {
    let responseData: any;

    await session.withTransaction(
      async () => {
        /**
         validate match, tournament, schedule
         */
        const [tournament, match, schedule] = await Promise.all([
          Tournament.exists({ _id: tournamentId }).session(session),

          Match.findOne({
            _id: matchId,
            tournamentId,
          })
            .select("status")
            .lean()
            .session(session),

          Schedule.findOne({ matchId })
            .select("status")
            .lean()
            .session(session),
        ]);

        // validate tournament
        if (!tournament) {
          throw new ApiError(404, "Tournament not found");
        }

        // validate match
        if (!match) {
          throw new ApiError(404, "Match not found");
        }

        // validate schedule
        if (!schedule) {
          throw new ApiError(404, "Schedule not found");
        }

        // validate transition
        const allowedTransitions = validStatusTransitions[match.status] || [];

        if (!allowedTransitions.includes(newStatus)) {
          throw new ApiError(
            400,
            `Invalid status transition from ${match.status} to ${newStatus}`
          );
        }

        /**
         update match and schedule, stop race condition of promise all
         */
        const [matchUpdate, scheduleUpdate] = await Promise.all([
          Match.updateOne(
            {
              _id: matchId,
              tournamentId,
              status: match.status,
            },
            {
              $set: { status: newStatus },
            },
            { session }
          ),

          Schedule.updateOne(
            {
              matchId,
              status: schedule.status,
            },
            {
              $set: { status: newStatus },
            },
            { session }
          ),
        ]);

        if (matchUpdate.matchedCount === 0) {
          throw new ApiError(
            409,
            "Match status changed during update. Please try again"
          );
        }

        if (scheduleUpdate.matchedCount === 0) {
          throw new ApiError(
            409,
            "Schedule status changed during update. Please try again"
          );
        }

        responseData = { status: newStatus };
      },
      {
        readConcern: { level: "snapshot" },
        writeConcern: { w: "majority" },
      }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, responseData, "Match status updated successfully")
      );
  } catch (error) {
    // transaction auto rollback on throw
    throw error;
  } finally {
    await session.endSession();
  }
});
