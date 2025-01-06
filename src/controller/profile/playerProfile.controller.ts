import { PlayerProfile } from "../../models/profilesModel/playerProfile.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const create_PlayerProfile = asyncHandler(async (req, res) => {
  const player = (req as any).user;

  // validate user
  if (!player || !player._id) {
    throw new ApiError(400, "Invalid token, user not found");
  }

  // create player profile
  if (player.role !== "player") {
    // check profile already exist or not
    throw new ApiError(400, "User role is not player");
  }
  const existingPlayerProfile = await PlayerProfile.findOne({
    userId: player._id,
  });

  if (existingPlayerProfile) {
    throw new ApiError(409, "Profile already exists");
  }

  // get data from req body
  const { role, batingStyle, bowlingArm, bowlingStyle, DateOfBirth } = req.body;
  // validate
  if (!role || !batingStyle || !bowlingArm || !bowlingStyle || !DateOfBirth) {
    throw new ApiError(400, "Required fields are missing");
  }

  const profile = await PlayerProfile.create({
    userId: player._id,
    player_role: role,
    batingStyle,
    bowlingArm,
    bowlingStyle,
    DateOfBirth,
  });

  if (!profile) {
    throw new ApiError(400, "Player Profile creation failed");
  }

  // retun response
  return res
    .status(201)
    .json(new ApiResponse(201, profile, "Player Profile created successfully"));
});
