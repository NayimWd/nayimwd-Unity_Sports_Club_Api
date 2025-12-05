import { TournamentResult } from "../../models/tournamentModel/tournamentResult.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const getLetestTournamentResult = asyncHandler(async (req, res) => {
  const tournament = await Tournament.findOne({ status: "completed" })
    .select("_id tournamentName photo endDate")
    .lean();

  if (!tournament) {
    throw new ApiError(404, "tournament not found");
  }

  const result = await TournamentResult.findOne({tournamentId: tournament._id})
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
    result,
  };

  // send response
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Tournament result fetched successfully"));
});
