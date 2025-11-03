import { Team } from "../../models/teamModel/teams.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const getMyteam = asyncHandler(async (req, res) => {
  // get manager id
  const userId = (req as any).user._id;
  if (!userId) {
    throw new ApiError(400, "Invalid token, user not found");
  }

  const team = await Team.findOne({ managerId: userId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        team,
        team ? "Team fetched successfully" : "Team Not Found"
      )
    );
});
