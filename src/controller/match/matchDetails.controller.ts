import { Innings } from "../../models/matchModel/innings.model";
import { Match } from "../../models/matchModel/match.model";
import { MatchResult } from "../../models/matchModel/matchResult.model";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const matchDetails = asyncHandler(async (req, res) => {
  // get tournament Id and match id from req params
  const {  matchId } = req.params;

  // validate inputs
  if (!matchId) {
    throw new ApiError(400, "Please provide tournament ID and match ID");
  }

  // check if the match exists

  const existingMatch = await Match.findById(matchId);

  if (!existingMatch) {
    throw new ApiError(404, "Match not found");
  }

  // fetch match details
  const match = await Match.findById({ _id: matchId})
    .populate("teamA", "teamName teamLogo")
    .populate("teamB", "teamName teamLogo")
    .populate("umpires.firstUmpire", "name")
    .populate("umpires.secondUmpire", "name")
    .populate("umpires.thirdUmpire", "name")
    .lean();

  if (!match) {
    throw new ApiError(404, "Match not found");
  }

  // fetch schedule for match details
  const schedule = await Schedule.findOne({ matchId })
    .select("-teams -previousMatches -tournamentId -matchId")
    .populate("venueId", "name location")
    .lean();

  // fetch result if available
  const result = await MatchResult.findOne({ matchId })
    .select("winner defeated method manOfTheMatch matchReport")
    .populate("manOfTheMatch", "name photo")
    .lean();

  // fetch innings details for each team if available
  const [innings1, innings2] = await Promise.all([
    Innings.findOne({ matchId, inningsNumber: 1 }).lean(),
    Innings.findOne({ matchId, inningsNumber: 2 }).lean(),
  ]);

  // match summary
  let matchSummary;
  if (result) {
    matchSummary = {
      teamA_stats: `${(match as any).teamA.teamName} ${innings1?.totalRuns || 0}-${innings1?.wicket || 0}`,
      teamB_stats: `${(match as any).teamB.teamName} ${innings2?.totalRuns || 0}-${innings2?.wicket || 0}`,
      margin: result?.margin,
      winner: result?.winner,
      report: result?.matchReport,
      method: result?.method,
      manOftheMatch: result.manOfTheMatch,
    };
  }

  // constract response
  const matchDetails = {
    match: match,
    matchInfo: schedule || null,
    MatchResult: result ? matchSummary : null,
  };

  // return response
  return res
    .status(200)
    .json(
      new ApiResponse(200, matchDetails, "Match details fetched successfully")
    );
});
