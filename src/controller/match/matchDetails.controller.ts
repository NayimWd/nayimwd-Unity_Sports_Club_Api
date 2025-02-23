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
  const { tournamentId, matchId } = req.params;

  // validate inputs
  if (!tournamentId || !matchId) {
    throw new ApiError(400, "Please provide tournament ID and match ID");
  }

  // check if the tournament and match exists
  const existingTournament = await Tournament.findById(tournamentId);
  if (!existingTournament) {
    throw new ApiError(404, "Tournament not found");
  }

  const existingMatch = await Match.findById(matchId);

  if (!existingMatch) {
    throw new ApiError(404, "Match not found");
  }

  // fetch match details
  const match = await Match.findById({ _id: matchId, tournamentId })
    .populate(
      "tournamentId",
      "tournamentName format startDate endDate tournamentLogo"
    )
    .populate("teamA", "teamName teamLogo")
    .populate("teamB", "teamName teamLogo")
    .populate("umpires.firstUmpire", "name role")
    .populate("umpires.secondUmpire", "name role")
    .populate("umpires.thirdUmpire", "name role")
    .lean();

  if (!match) {
    throw new ApiError(404, "Match not found");
  }

  // fetch schedule for match details
  const schedule = await Schedule.findOne({ matchId })
    .populate("venueId", "venueName location")
    .lean();

  // fetch result if available
  const result = await MatchResult.findOne({ matchId }).lean();

  // fetch innings details if available
  const innings = await Innings.findOne({ matchId })
    .populate("teamId", "teamName teamLogo")
    .lean();

  // constract response
  const matchDetails = {
    match: match,
    venue: schedule || null,
    MatchResult: MatchResult ? match : null,
    innings: innings ? innings : null,
  };

  // return response
  return res
    .status(200)
    .json(
      new ApiResponse(200, matchDetails, "Match details fetched successfully")
    );
});
