import { info } from "console";
import { Innings } from "../../models/matchModel/innings.model";
import { Match } from "../../models/matchModel/match.model";
import { MatchResult } from "../../models/matchModel/matchResult.model";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { Team } from "../../models/teamModel/teams.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const getAllMatch = asyncHandler(async (req, res) => {
  // extract parameters
  const { tournamentId } = req.params;
  const { teamName, status } = req.query;

  // validate inputs
  if (!tournamentId) {
    throw new ApiError(400, "Please provide tournament ID");
  }

  // check if the tournament exists
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }

  // build search filter
  const filter: any = { tournamentId };

  // filter by status if provided
  const validateStatus = [
    "upcoming",
    "scheduled",
    "rescheduled",
    "in-progress",
    "completed",
    "cancelled",
  ];
  if (status && validateStatus.includes(status as string)) {
    filter.status = status;
  }

  // filter by team name if provided
  if (teamName) {
    const teams = await Team.find({
      teamName: new RegExp(teamName as string, "i"),
    }).select("_id");
    if (teams.length > 0) {
      filter.$or = [{ teamA: { $in: teams } }, { teamB: { $in: teams } }];
    } else {
      return res.status(200).json([]); // Return empty if no teams match
    }
  }

  // fetch matches
  const matches = await Match.find(filter)
    .populate("teamA", "teamName teamLogo")
    .populate("teamB", "teamName teamLogo")
    .lean();

  // Fetch related match details
  const enrichedMatches = await Promise.all(
    matches.map(async (match) => {
      // Fetch innings data
      const [innings1, innings2] = await Promise.all([
        Innings.findOne({ matchId: match._id, inningsNumber: 1 }),
        Innings.findOne({ matchId: match._id, inningsNumber: 2 }),
      ]);

      // Fetch match result
      const matchResult = await MatchResult.findOne({ matchId: match._id })
        .populate("manOfTheMatch", "name photo")
        .lean();

      // Prepare match summary
      let matchSummary;
      if (matchResult) {
        matchSummary = {
          teamA_stats: `${(match as any).teamA.teamName} ${innings1?.totalRuns || 0}-${innings1?.wicket || 0}`,
          teamB_stats: `${(match as any).teamB.teamName} ${innings2?.totalRuns || 0}-${innings2?.wicket || 0}`,
          margin: matchResult.margin,
          manOftheMatch: matchResult.manOfTheMatch,
        };
      } else {
        // Fetch schedule data if match result is unavailable
        const schedule = await Schedule.findOne({ matchId: match._id }).select(
          "matchDate matchTime"
        );
        matchSummary = {
          matchDate: schedule?.matchDate || "TBD",
          matchTime: schedule?.matchTime || "TBD",
        };
      }

      return {
        ...match,
        matchSummary,
      };
    })
  );

  // return response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total: matches.length,
        match: enrichedMatches,
      },
      "Matches fetched successfully"
    )
  );
});
