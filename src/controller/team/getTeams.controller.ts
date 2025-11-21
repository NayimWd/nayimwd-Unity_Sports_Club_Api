import { PlayerProfile } from "../../models/profilesModel/playerProfile.model";
import { TeamPlayer } from "../../models/teamModel/teamPlayer.model";
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
    .sort(sort)
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
  // fetch team
  const team = await Team.findById(teamId)
    .populate("managerId", "name email photo")
    .lean();

  if (!team) {
    throw new ApiError(404, "No Team found under this id");
  }

  // team player
  const teamPlayers = await TeamPlayer.find({ teamId })
    .populate("playerId", "_id name photo")
    .lean();

  // extract player id
  const playerIds = teamPlayers.map((p) => p.playerId._id);

  // get player profiles by player ids
  const profiles = await PlayerProfile.find({
    userId: { $in: playerIds },
  })
    .select("userId player_role")
    .lean();

  const profileMap: Record<string, any> = {};

  profiles.forEach((p: any) => {
    profileMap[p.userId.toString()] = p.player_role;
  });

  const players = teamPlayers.map((tp) => {
    const player: any = tp.playerId;
    return {
      _id: player._id,
      name: player?.name || null,
      photo: player?.photo || null,
      isCaptain: tp.isCaptain,
      status: tp.status,
      role: profileMap[player._id.toString()] || null,
    };
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        team,
        players,
      },
      "Team found successfully"
    )
  );
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
