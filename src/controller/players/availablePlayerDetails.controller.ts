import { PlayerProfile } from "../../models/profilesModel/playerProfile.model";
import { User } from "../../models/userModel/user.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const availablePlayerDetails = asyncHandler(async (req, res) => {
  // step 1: get player id from query
  const { playerId } = req.params;
  if (!playerId) {
    throw new ApiError(400, "Player ID is required");
  }

  // validate if player exists
  const existingPlayer = await User.findById({ _id: playerId });
  if (!existingPlayer) {
    throw new ApiError(404, "Player not found");
  }

  // get player profile
  const playerProfile = await PlayerProfile.findOne({
    userId: playerId,
  }).populate({
    path: "userId",
    select: "name photo",
  });

  if (!playerProfile) {
    throw new ApiError(404, "Player profile not found");
  }

  // return response
  return res
    .status(200)
    .json(
      new ApiResponse(200, playerProfile, "Player profile fetched successfully")
    );
});
