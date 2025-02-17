import { Match } from "../../models/matchModel/match.model";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const createMatch = asyncHandler(async (req, res) => {
  // Authentication
  const author = (req as any).user;
  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to create a match");
  }

  // Extract parameters
  const { tournamentId } = req.params;
  const { teamA, teamB, matchNumber, previousMatches } = req.body;

  // Validate inputs
  if (!tournamentId || !matchNumber) {
    throw new ApiError(400, "Please provide tournament ID, and match number.");
  }

  // check if the tournament exists
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }

  // ensure match number is unique per tournament
  const existingMatch = await Match.findOne({ tournamentId, matchNumber });
  if (existingMatch) {
    throw new ApiError(400, "Match number already exists for this tournament");
  }

  // validate team teamA and teamB or previousMatches.matchA and matchB
  if (
    (!teamA || !teamB) &&
    (!previousMatches || !previousMatches?.matchA || !previousMatches?.matchB)
  ) {
    throw new ApiError(
      400,
      "Please provide either teamA and teamB or previousMatches.matchA and matchB"
    );
  }

  // find pre-schedule venue]
  const schedule = await Schedule.findOne({ tournamentId, matchNumber });
  if (!schedule) {
    throw new ApiError(404, "Schedule not found");
  }

  // create match
  const match = new Match({
    tournamentId,
    matchNumber,
    teamA,
    teamB,
    previousMatches,
    status: "upcoming",
  });
  // save match
  await match.save();

  // update schedule with matchId
  schedule.matchId = match._id;
  await schedule.save();

  // send response
  return res
    .status(201)
    .json(new ApiResponse(201, match, "Match created successfully"));
});
