import mongoose from "mongoose";
import { Innings } from "../../models/matchModel/innings.model";
import { Match } from "../../models/matchModel/match.model";
import { MatchResult } from "../../models/matchModel/matchResult.model";
import { PointTable } from "../../models/point table/pointTables.model";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { TeamPlayer } from "../../models/teamModel/teamPlayer.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const createMatchResult = asyncHandler(async (req, res) => {
  // Authentication
  const author = (req as any).user;

  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to create a match");
  }
  // get tournament  match id and data
  const { tournamentId, matchId } = req.params;
  const { manOfTheMatch, method = "normal", matchReport } = req.body;

  if (!tournamentId || !matchId || !manOfTheMatch) {
    throw new ApiError(
      400,
      "Tournament ID, Match ID, and Man of the Match are required"
    );
  }

  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      // ----------------------------
      // 1. get main- match + tournament in parallel
      // ----------------------------
      const [tournament, match] = await Promise.all([
        Tournament.exists({ _id: tournamentId }).session(session),
        Match.findById(matchId)
          .select("teamA teamB status tournamentId")
          .lean()
          .session(session),
      ]);

      if (!tournament || !match) {
        throw new ApiError(404, "Tournament or Match not found.");
      }

      // ----------------------------
      // 2. match must be contain innings, validation innings
      // ----------------------------
      const innings = await Innings.find({ matchId }).lean().session(session);

      const innings1 = innings.find((i) => i.inningsNumber === 1);
      const innings2 = innings.find((i) => i.inningsNumber === 2);

      if (!innings1 || !innings2) {
        throw new ApiError(
          400,
          "Both innings must be completed before creating a match result"
        );
      }

      // ----------------------------
      // 3. winner + defeated
      // ----------------------------
      let winner: any;
      let defeated: any;
      let margin: string;

      if (innings1.totalRuns > innings2.totalRuns) {
        winner = innings1.teamId;
        defeated = innings2.teamId;
        margin = `${innings1.totalRuns - innings2.totalRuns} runs`;
      } else if (innings2.totalRuns > innings1.totalRuns) {
        winner = innings2.teamId;
        defeated = innings1.teamId;
        margin = `${innings2.totalRuns - innings1.totalRuns} runs`;
      } else {
        winner = null;
        defeated = null;
        margin = "Match Tied";
      }

      if (winner) {
        const winnerInnings = winner.equals(innings1.teamId)
          ? innings1
          : innings2;

        const wicketMargin = 10 - winnerInnings.wicket;
        margin += ` and ${wicketMargin} wickets`;
      }

      // ----------------------------
      // 4. Validate man of the match
      // ----------------------------
      const existingPlayer = await TeamPlayer.findOne({
        playerId: manOfTheMatch,
        teamId: { $in: [match.teamA, match.teamB] },
      }).session(session);

      if (!existingPlayer) {
        throw new ApiError(
          400,
          "Man of the Match must belong to one of the playing teams."
        );
      }

      // ----------------------------
      // 5. create match result
      // ----------------------------
      const matchResult = await MatchResult.create(
        [
          {
            tournamentId,
            matchId,
            winner,
            defeated,
            margin,
            method,
            manOfTheMatch,
            matchReport,
            photo: null,
          },
        ],
        { session }
      );

      if (!matchResult || !matchResult.length) {
        throw new ApiError(500, "Failed to create match result.");
      }

      // ----------------------------
      // 6. update match + schedule atomically
      // ----------------------------
      await Promise.all([
        Match.updateOne(
          { _id: matchId },
          { $set: { status: "completed" } },
          { session }
        ),
        Schedule.updateOne(
          { matchId },
          { $set: { status: "completed" } },
          { session }
        ),
      ]);

      // ----------------------------
      // 7. update points table atomically
      // ----------------------------
      if (winner) {
        await Promise.all([
          PointTable.updateOne(
            { tournamentId, teamId: winner },
            {
              $inc: {
                wins: 1,
                losses: 0,
                ties: 0,
                matchPlayed: 1,
                points: 2,
              },
            },
            { upsert: true, session }
          ),
          PointTable.updateOne(
            { tournamentId, teamId: defeated },
            {
              $inc: {
                wins: 0,
                losses: 1,
                ties: 0,
                matchPlayed: 1,
                points: 0,
              },
            },
            { upsert: true, session }
          ),
        ]);
      } else {
        await Promise.all([
          PointTable.updateOne(
            { tournamentId, teamId: match.teamA },
            {
              $inc: {
                wins: 0,
                losses: 0,
                ties: 1,
                matchPlayed: 1,
                points: 1,
              },
            },
            { upsert: true, session }
          ),
          PointTable.updateOne(
            { tournamentId, teamId: match.teamB },
            {
              $inc: {
                wins: 0,
                losses: 0,
                ties: 1,
                matchPlayed: 1,
                points: 1,
              },
            },
            { upsert: true, session }
          ),
        ]);
      }

      // ----------------------------
      // 8. update future match team a or b
      // ----------------------------
      const futureMatches = await Match.find({
        tournamentId,
        $or: [
          { "previousMatches.matchA": matchId },
          { "previousMatches.matchB": matchId },
        ],
      })
        .session(session)
        .lean();

      await Promise.all(
        futureMatches.map(async (fm) => {
          if (fm.previousMatches?.matchA?.toString() === matchId.toString()) {
            await Match.updateOne(
              { _id: fm._id },
              { $set: { teamA: winner } },
              { session }
            );

            await Schedule.updateOne(
              { matchId: fm._id },
              { $set: { "teams.teamA": winner } },
              { session }
            );
          }

          if (fm.previousMatches?.matchB?.toString() === matchId.toString()) {
            await Match.updateOne(
              { _id: fm._id },
              { $set: { teamB: winner } },
              { session }
            );

            await Schedule.updateOne(
              { matchId: fm._id },
              { $set: { "teams.teamB": winner } },
              { session }
            );
          }
        })
      );

      // ----------------------------
      // 9. if final match completed update tournament to completed
      // ----------------------------
      const finalSchedule = await Schedule.findOne({
        round: "final",
        status: "completed",
      }).session(session);

      if (finalSchedule) {
        await Tournament.updateOne(
          { _id: tournamentId },
          { $set: { status: "completed" } },
          { session }
        );
      }

      return matchResult[0];
    });

    return res
      .status(201)
      .json(new ApiResponse(201, result, "Match Result created successfully"));
  } finally {
    await session.endSession();
  }
});
