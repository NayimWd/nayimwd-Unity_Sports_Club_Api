import { PlayerProfile } from "../../models/profilesModel/playerProfile.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const updatePlayerProfile = asyncHandler(async (req, res) => {
  const player = (req as any).user;
  if (!player?._id) throw new ApiError(400, "Invalid token, user not found");
  if (player.role !== "player")
    throw new ApiError(403, "User role is not player");

  const allowedFields = [
    "player_role",
    "batingStyle",
    "bowlingArm",
    "bowlingStyle",
    "DateOfBirth",
  ];

  //  only allowed fields and ignore extra ones
  const updates: Record<string, any> = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  // least one valid field is present
  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "At least one valid field is required to update");
  }

  //   update
  const updatedProfile = await PlayerProfile.findOneAndUpdate(
    { userId: player._id },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!updatedProfile) throw new ApiError(404, "Player profile not found");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedProfile,
        "Player Profile updated successfully"
      )
    );
});
