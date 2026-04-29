import mongoose from "mongoose";
import { Match } from "../../models/matchModel/match.model";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const updateTeamAndMatch = asyncHandler(async (req, res) => {
  // authenticate and authorize user
  const author = (req as any).user;

  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to update match status");
  }

  // get params + body
  const { matchId } = req.params;
  const {
    teamA: newTeamA,
    teamB: newTeamB,
    previousMatches: newPreviousMatches,
  } = req.body;

  if (!matchId) {
    throw new ApiError(400, "Match Id is required");
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(
      async () => {
        /**
         fetch match and validate + based on match id fetch schedule
         */
        const match = await Match.findById(matchId)
          .select("status tournamentId teamA teamB previousMatches")
          .lean()
          .session(session);

        if (!match) {
          throw new ApiError(404, "Match not found");
        }

        // block updates on locked states
        if (["completed", "in-progress", "cancelled"].includes(match.status)) {
          throw new ApiError(
            400,
            `Match cannot be updated as it is already ${match.status}`
          );
        }

        /**
         * load schedule
         */
        const schedule = await Schedule.findOne({ matchId })
          .select("matchDate teams previousMatches status")
          .lean()
          .session(session);

        if (!schedule) {
          throw new ApiError(
            404,
            "Schedule not found for this match. Cannot proceed with update."
          );
        }

        // final values
        const finalTeamA = newTeamA || match.teamA;
        const finalTeamB = newTeamB || match.teamB;
        const finalPreviousMatches =
          newPreviousMatches || match.previousMatches;

        /**
         check team conflict
         */
        const [scheduleConflict, matchConflict] = await Promise.all([
          Schedule.findOne({
            matchId: { $ne: matchId },
            tournamentId: match.tournamentId,
            matchDate: { $lt: schedule.matchDate },
            $or: [
              { "teams.teamA": { $in: [finalTeamA, finalTeamB] } },
              { "teams.teamB": { $in: [finalTeamA, finalTeamB] } },
            ],
          })
            .select("_id")
            .lean()
            .session(session),

          Match.findOne({
            _id: { $ne: matchId },
            tournamentId: match.tournamentId,
            $or: [
              { teamA: { $in: [finalTeamA, finalTeamB] } },
              { teamB: { $in: [finalTeamA, finalTeamB] } },
            ],
          })
            .select("_id")
            .lean()
            .session(session),
        ]);

        if (scheduleConflict || matchConflict) {
          throw new ApiError(
            400,
            "One or both teams have already played a scheduled match before this match."
          );
        }

        /**
         previous match conflict checks
         */
        if (finalPreviousMatches?.matchA && finalPreviousMatches?.matchB) {
          const previousIds = [
            finalPreviousMatches.matchA,
            finalPreviousMatches.matchB,
          ];

          const [prevScheduleConflict, prevMatchConflict] = await Promise.all([
            Schedule.findOne({
              matchId: { $in: previousIds, $ne: matchId },
              matchDate: { $lt: schedule.matchDate },
            })
              .select("_id")
              .lean()
              .session(session),

            Match.findOne({
              _id: { $in: previousIds, $ne: matchId },
            })
              .select("_id")
              .lean()
              .session(session),
          ]);

          if (prevScheduleConflict || prevMatchConflict) {
            throw new ApiError(
              400,
              "One or both previous matches have already been scheduled before this match."
            );
          }
        }

        /**
          updates with status guard
         */
        const [matchUpdate, scheduleUpdate] = await Promise.all([
          Match.updateOne(
            {
              _id: matchId,
              status: match.status,
            },
            {
              $set: {
                teamA: finalTeamA,
                teamB: finalTeamB,
                previousMatches: finalPreviousMatches,
              },
            },
            { session }
          ),

          Schedule.updateOne(
            {
              matchId,
              status: schedule.status,
            },
            {
              $set: {
                "teams.teamA": finalTeamA,
                "teams.teamB": finalTeamB,
                previousMatches: finalPreviousMatches,
              },
            },
            { session }
          ),
        ]);

        if (matchUpdate.matchedCount === 0) {
          throw new ApiError(
            409,
            "Match changed during update. Please try again."
          );
        }

        if (scheduleUpdate.matchedCount === 0) {
          throw new ApiError(
            409,
            "Schedule changed during update. Please try again."
          );
        }
      },
      {
        readConcern: { level: "snapshot" },
        writeConcern: { w: "majority" },
      }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, null, "Match and schedule updated successfully")
      );
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
});
