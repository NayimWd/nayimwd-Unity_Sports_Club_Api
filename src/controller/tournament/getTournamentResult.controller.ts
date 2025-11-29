import { TournamentResult } from "../../models/tournamentModel/tournamentResult.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const getTournamentResult = asyncHandler(async (req, res) => {
  // get tournament Id from req params
  const { tournamentId } = req.params;
  if (!tournamentId) {
    throw new ApiError(400, "Please provide tournament ID");
  }

  // check if the tournament exists
  const tournament = await Tournament.findById(tournamentId)
  .select("tournamentName photo")

  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }

  // fetch tournament result
  const result = await TournamentResult.findOne({ tournamentId })
    .populate({
      path: "manOfTheTournament",
      model: "User",
      select: "name photo",
    })
    .populate({
      path: "result.champion",
      model: "Team",
      select: "teamName teamLogo",
    })
    .populate({
      path: "result.runnerUp",
      model: "Team",
      select: "teamName teamLogo",
    })
    .populate({
      path: "result.thirdPlace",
      model: "Team",
      select: "teamName teamLogo",
    })
    .lean();

  if (!result) {
    throw new ApiError(404, "Tournament result not found");
  }

  const data = {
    tournament,
    result
  }

  // send response
  return res
    .status(200)
    .json(
      new ApiResponse(200, data, "Tournament result fetched successfully")
    );
});
