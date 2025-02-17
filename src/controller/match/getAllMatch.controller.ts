import { Match } from "../../models/matchModel/match.model";
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
    .populate("winner", "teamName teamLogo")
    .lean();

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, matches, "Matches fetched successfully"));
});
