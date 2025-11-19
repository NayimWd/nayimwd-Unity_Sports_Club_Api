import { Team } from "../../models/teamModel/teams.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const getAllTeams = asyncHandler(async (req, res) => {
  // query params
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = (req.query.search as string) || "";
  const sort = (req.query.sort as string) || "-createdAt";
  const skip = (page - 1) * limit;

  // search filter
  const searchFilter = search
    ? { teamName: { $regex: search, $options: "i" } }
    : {};

  // DB query
  const teams = await Team.find(searchFilter)
    .sort(sort) // ex: "teamName", "-playerCount", "-createdAt"
    .skip(skip)
    .limit(limit)
    .select("_id teamName teamLogo playerCount")
    .lean();

  // Total count
  const totalTeams = await Team.countDocuments(searchFilter);

  const response = {
    teams,
    currentPage: page,
    totalPages: Math.ceil(totalTeams / limit),
    totalTeams,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Teams fetched successfully"));
});

// single team controller
export const getTeamDetails = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  const team = await Team.findById(teamId).populate("managerId", "name email");

  if (!team) {
    throw new ApiError(404, "No Team found under this id");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, team, "Team found successfully"));
});

export const getMyteam = asyncHandler(async (req, res) => {
  // get manager id
  const userId = (req as any).user._id;
  if (!userId) {
    throw new ApiError(400, "Invalid token, user not found");
  }

  const team = await Team.findOne({ managerId: userId });

  if (!team) {
    throw new ApiError(404, "You do not have any team yet!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, team, "Team fetched successfully"));
});
