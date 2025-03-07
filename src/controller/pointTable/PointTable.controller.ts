import { PointTable } from "../../models/point table/pointTables.model";
import { Team } from "../../models/teamModel/teams.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const getPointTable = asyncHandler(async (req, res) => {
  // get tournamentId from req params
  const { tournamentId } = req.params;
  if (!tournamentId) {
    throw new ApiError(400, "Please provide tournamentId");
  }
  // team name from req query
  const { search, sortBy, order, minWins, minPoints, maxLosses } = req.query;

  // check if tournament exists
  const tournament =
    await Tournament.findById(tournamentId).select("tournamentName");
  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }

  // Build query filters
  const query: any = { tournamentId };
  // Search by team name (case-insensitive)
  if (search) {
    const regex = new RegExp(search as any, "i");
    const teams = await Team.find({ teamName: regex }).select("_id");
    query.teamId = { $in: teams.map((team) => team._id) };
  }

  // Apply real-world filters
  if (minWins) query.wins = { $gte: Number(minWins) };
  if (minPoints) query.points = { $gte: Number(minPoints) };
  if (maxLosses) query.losses = { $lte: Number(maxLosses) };

  // Sorting logic
  const sortOptions: any = {};
  if (sortBy) {
    const validSortFields = ["points", "wins", "losses", "ties"];
    if (!validSortFields.includes(sortBy as any)) {
      throw new ApiError(
        400,
        `Invalid sort field. Allowed: ${validSortFields.join(", ")}`
      );
    }
    sortOptions[sortBy as any] = order === "asc" ? 1 : -1; // Default to descending
  } else {
    sortOptions["points"] = -1; // Default sorting by highest points
  }

  // fetch point table
  const pointTable = await await PointTable.find(query)
    .populate({ path: "teamId", select: "teamName logo" }) // Populate team details
    .select("-__v -updatedAt") // Exclude unnecessary fields
    .sort(sortOptions)
    .lean();

  if (!pointTable) {
    throw new ApiError(404, "Point table not found");
  }

  // return response
  res.status(200).json(
    new ApiResponse(
      200,
      {
        tournament: tournament.tournamentName,
        pointTable,
      },
      "Point table fetched successfully"
    )
  );
});
