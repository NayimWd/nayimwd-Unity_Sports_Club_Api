import path from "path";
import { Innings } from "../../models/matchModel/innings.model";
import { Match } from "../../models/matchModel/match.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const getMatchInnings = asyncHandler(async (req, res) => {
  // get data from req body
  const { matchId } = req.params;
  // validate
  if (!matchId) {
    throw new ApiError(400, "Match ID required");
  }

  // check if match exists
  const match = await Match.findById(matchId);
  if (!match) {
    throw new ApiError(400, "Match not found by this id");
  }

  // fetch innings by match Id
  const [innings1, innings2] = await Promise.all([
    Innings.findOne({ matchId: matchId, inningsNumber: 1 }).populate({
      path: "teamId",
      model: "Team",
      select: "teamName teamLogo",
    }),
    Innings.findOne({ matchId: matchId, inningsNumber: 2 }).populate({
      path: "teamId",
      model: "Team",
      select: "teamName teamLogo",
    }),
  ]);

  if (!innings1 && innings2) {
    throw new ApiError(404, "Innings not created yet");
  }

  // return response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        innings1: innings1,
        innings2: innings2,
      },
      "Match Innings fetched successfully"
    )
  );
});

export const getTournamentInnings = asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;

  if (!tournamentId) {
    throw new ApiError(400, "tournament Id required");
  }

  // check if tournament exists
  const tournament = await Tournament.findById(tournamentId);

  if (!tournament) {
    throw new ApiError(404, "Tournament Not found");
  }

  // fetch innings of tournament
  const tournamentInnings = await Innings.find({ tournamentId })
    .select("tournamentId teamId inningsNumber wicket totalRuns")
    .populate({
      path: "teamId",
      model: "Team",
      select: "teamName teamLogo",
    });

  if (!tournamentInnings) {
    throw new ApiError(400, "fetch tournament Innings failed");
  }

  const total = await Innings.countDocuments();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total,
        tournamentInnings,
      },
      "Tournament Innings fetched successfully"
    )
  );
});
