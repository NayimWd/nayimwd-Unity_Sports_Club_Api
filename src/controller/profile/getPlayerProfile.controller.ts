import { PlayerProfile } from "../../models/profilesModel/playerProfile.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const getPlayerProfile = asyncHandler(async (req, res) => {
  const player = (req as any).user;
  if (!player || !player._id) {
    throw new ApiError(400, "Invalid token, player not found");
  }

  const profile = await PlayerProfile.findOne({ userId: player._id }).populate({
    path: "teamId",
    select: "teamName teamLogo",
  });

  // return response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        profile || null,
        profile
          ? "Player profile fetched successfully"
          : "Player Profile not found"
      )
    );
});
