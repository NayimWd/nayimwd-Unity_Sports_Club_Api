import mongoose, { model } from "mongoose";
import { TeamPlayer } from "../../models/teamModel/teamPlayer.model";
import { Team } from "../../models/teamModel/teams.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { PlayerProfile } from "../../models/profilesModel/playerProfile.model";

export const getTeamPlayers = asyncHandler(async(req, res)=>{
    const { teamId } = req.params;

    // Validate team ID
    if (!teamId) {
      throw new ApiError(400, "Team ID is required");
    }
  
    // Fetch team to get manager details
    const team = await Team.findById(teamId).select("managerId").populate({
      path: "managerId",
      select: "name photo", // Fetch manager details
    });
  
    if (!team) {
      throw new ApiError(404, "Team not found");
    }
  
    // Fetch team members with populated player details
    const teamMembers = await TeamPlayer.find({ teamId })
      .populate({
        path: "playerId", // "playerId" references the User schema
        select: "name role photo", // Fetch name, role, and photo
      });
  
    // Respond with data
    res.status(200).json({
      success: true,
      data: {
        manager: team.managerId, // Include manager details
        number: teamMembers.length,
        players: teamMembers, // Include populated player details
      },
      message: "Team members fetched successfully",
    });
});

// get team player details
export const getTeamPlayerDetails = asyncHandler(async(req, res)=>{
  // get team player id from request params
  const {playerId} = req.params;

  // validate id
  if(!playerId || !mongoose.isValidObjectId(playerId)){
    throw new ApiError(400, "valid player ID is required");
  };

  // get player details
  const player = await TeamPlayer.findOne({playerId})
  .populate({
    path: "playerId", // Populate User details
    model: "User",
    select: "name role photo", // Fields from User schema
  })
  .populate({
    path: "teamId", // Populate Team details
    model: "Team",
    select: "teamName teamLogo",
  })
  .lean();

  // get player profile by player id
  const playerProfile = await PlayerProfile.findOne({ userId: playerId })
  .select("player_role batingStyle bowlingArm bowlingStyle DateOfBirth photo");

  if(!player){
    throw new ApiError(404, "Player not found with this id")
  }

  // make response
  const response = {
    player,
    playerProfile,
  }

  // send response
  res
    .status(200)
    .json(new ApiResponse(200, response, "Player details fetched successfully"));
});