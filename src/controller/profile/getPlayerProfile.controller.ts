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
    path: "userId",
    select: "name photo",
  });

  if (!profile) {
    throw new ApiError(404, "Player profile not found");
  }

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, profile, "Player profile fetched successfully"));
});
