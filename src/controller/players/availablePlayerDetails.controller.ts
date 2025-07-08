import mongoose from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { TeamPlayer } from "../../models/teamModel/teamPlayer.model";
import { PlayerProfile } from "../../models/profilesModel/playerProfile.model";
import { ApiResponse } from "../../utils/ApiResponse";

export const getPlayerDetails = asyncHandler(async (req, res) => {
  // get team player id from request params
  const { playerId } = req.params;

  // validate id
  if (!playerId || !mongoose.isValidObjectId(playerId)) {
    throw new ApiError(400, "valid player ID is required");
  }

  // get player details
  const player = await TeamPlayer.findOne({ playerId })
    .populate({
      path: "playerId", // Populate User details
      model: "User",
      select: "name role photo", // Fields from User schema
    })
    .populate({
      path: "teamId", // Populate Team details
      model: "Team",
      select: "teamName teamLogo",
    });

  if (!player) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { player: null, playerProfile: null },
          "No player found with this ID"
        )
      );
  }

  // get player profile by player id
  const playerProfile = await PlayerProfile.findOne({
    userId: playerId,
  }).select(
    "player_role batingStyle bowlingArm bowlingStyle DateOfBirth photo"
  );

  // make response
  const response = {
    player,
    PlayerProfile: playerProfile || null,
  };

  // send response
  res
    .status(200)
    .json(
      new ApiResponse(200, response, "Player details fetched successfully")
    );
});
