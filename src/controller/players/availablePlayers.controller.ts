import { PlayerProfile } from "../../models/profilesModel/playerProfile.model";
import { User } from "../../models/userModel/user.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const getAvailablePlayers = asyncHandler(async (req, res) => {
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
    .select("name photo") // Only fetch the required fields
    .sort(sortConfig)
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber);

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
      "Available players retrieved successfully"
    )
  );
});
