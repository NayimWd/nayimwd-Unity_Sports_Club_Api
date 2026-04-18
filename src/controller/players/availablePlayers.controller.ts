import { PlayerProfile } from "../../models/profilesModel/playerProfile.model";
import { User } from "../../models/userModel/user.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const getAvailablePlayers = asyncHandler(async (req, res) => {

  // get manager id
  const user = (req as any);
  if (!user) {
    throw new ApiError(400, "Invalid token, user not found");
  }

  // Step 1: Parse query parameters for pagination and sorting
  const {
    page = 1,
    limit = 10,
    sortBy = "name",
    sortOrder = "asc",
  } = req.query;

  // Convert pagination parameters to numbers
  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);

  if (
    isNaN(pageNumber) ||
    isNaN(limitNumber) ||
    pageNumber < 1 ||
    limitNumber < 1
  ) {
    throw new ApiError(400, "Invalid pagination parameters");
  }

  // Step 2: Fetch users with the role "player" who are not in any team
  const query = {
    role: "player",
    _id: {
      $nin: await PlayerProfile.distinct("userId", {
        teamId: { $exists: true },
      }),
    },
  };

  // Step 3: Sort configuration
  const sortConfig: any = {};
  sortConfig[sortBy as string] = sortOrder === "desc" ? -1 : 1;

  // Step 4: Get total available players count for pagination metadata
  const totalPlayers = await User.countDocuments(query);

  // Step 5: Fetch available players with pagination and sorting
  const players = await User.find(query)
    .select("_id name photo")
    .populate({
      path: "PlayerProfile",
      select: "player_role batingStyle bowlingStyle"
    })
    .sort(sortConfig)
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber)
    .lean();

  // Step 6: Prepare pagination metadata
  const totalPages = Math.ceil(totalPlayers / limitNumber);

  // Step 7: Return the response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        pagination: {
          totalPlayers,
          totalPages,
          currentPage: pageNumber,
          limit: limitNumber,
        },
        players,
      },
      players.length ? "Available players retrieved successfully" : "No Player available"
    )
  );
});


export const availablePlayerProfile = asyncHandler(async(req, res)=> {

    const author = (req as any).user;

  if (!author || !["admin", "staff", "manager"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to update the schedule.");
  }

 // 1. Parse query params
  const {
    page = "1",
    limit = "10",
    sortBy = "createdAt", 
    sortOrder = "asc",
  } = req.query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  if (
    !Number.isInteger(pageNumber) ||
    !Number.isInteger(limitNumber) ||
    pageNumber < 1 ||
    limitNumber < 1
  ) {
    throw new ApiError(400, "Invalid pagination parameters");
  }

  // 2. Build query (ONLY available players)
  const query = {
    teamId: { $exists: false }, // or null depending on schema
  };

  // 3. Sort config
  const sortConfig: any = {
    [sortBy as string]: sortOrder === "desc" ? -1 : 1,
  };

  // 4. Execute in parallel (important optimization)
  const [totalPlayers, profiles] = await Promise.all([
    PlayerProfile.countDocuments(query),
    PlayerProfile.find(query)
      .select("player_role battingStyle bowlingStyle userId")
      .populate({
        path: "userId",
        select: "_id name photo",
      })
      .sort(sortConfig)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .lean(),
  ]);

  // 5. Format response (clean UI shape)
  const players = profiles.map((p: any) => ({
    value: p.userId._id,
    label: p.userId.name,
    photo: p.userId.photo,
    role: p.player_role,
    battingStyle: p.battingStyle,
    bowlingStyle: p.bowlingStyle,
  }));

  const totalPages = Math.ceil(totalPlayers / limitNumber);

  // 6. Response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        pagination: {
          totalPlayers,
          totalPages,
          currentPage: pageNumber,
          limit: limitNumber,
        },
        players,
      },
      players.length
        ? "Available players retrieved successfully"
        : "No players available"
    )
  );
})