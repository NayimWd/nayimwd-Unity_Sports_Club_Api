import { Match } from "../../models/matchModel/match.model";
import { PlayingSquad } from "../../models/matchModel/playingSquad.model";
import { PlayerProfile } from "../../models/profilesModel/playerProfile.model";
import { TeamPlayer } from "../../models/teamModel/teamPlayer.model";
import { Team } from "../../models/teamModel/teams.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";

export const addPlayingSquad = asyncHandler(async(req: Request, res: Response)=>{
    // authentication and authorization  from token 
    const manager = (req as any).user;
    // validate
    if(!manager._id || manager.role !== "manager"){
        throw new ApiError(400, "Unauthorized request, Please Log in as a manager")
    };

    // get data from req params and body
    const {tournamentId, matchId} = req.params;
    const {teamId, players} = req.body;

    // validate
    if(!tournamentId || !matchId || !teamId || !players || !Array.isArray(players)){
        throw new ApiError(400, "Invalid request. Please provide tournamentId, matchId, teamId, and an array of players.");
    };

    // make sure player is exactly 11
    if(players.length !== 11){
        throw new ApiError(400, "Playing squad must contain exactly 11 players.");
    };

    // check if match exist
    const [match, team] = await Promise.all([
        Match.findOne({ _id: matchId, tournamentId, $or: [{ teamA: teamId }, { teamB: teamId }] }),
        Team.findById(teamId)
    ])
  
    if(!match){
        throw new ApiError(404, "Match not found or team is not part of this match.");
    };

   // check manager manager manager is exact team Player
    const isManager = team?.managerId.toString() === manager._id.toString();
    if(!isManager){
        throw new ApiError(403, "You are not manager of this team")
    };

    // check players is exists in team
    const teamPlayers = await TeamPlayer.find({ playerId: { $in: players }, teamId }).populate("playerId", "player_role");

    if (teamPlayers.length !== 11) {
        throw new ApiError(400, "One or more players are not part of the team.");
      };

      // Role Validation
  let batsmen = 0,
  wkBatsman = 0,
  allRounder = 0,
  bowlers = 0,
  captainCount = 0;
  
  let isCaptain;
    // 
  for(const teamPlayer of teamPlayers){
    const playerRole = await PlayerProfile.findById(teamPlayer.playerId)

    if(teamPlayer.isCaptain) {
        isCaptain = teamPlayer.playerId,
        captainCount++
    }

    if(!playerRole) continue;

    switch (playerRole.player_role){
        case "batsman" :
            batsmen++;
            break;
        case "wk-batsman" : 
            wkBatsman++
            break
        case "all-rounder" :
            allRounder++
            break
        case "bowler" : 
            bowlers++
            break
    }

  }


  // validate squade composition 
  if(batsmen < 4){
    throw new ApiError(400, "Squad must contain at least 4 batsmen.");
  }

  if (wkBatsman < 1) {
    throw new ApiError(400, "Squad must contain at least 1 wicketkeeper-batsman.");
  }

  if (allRounder < 1) {
    throw new ApiError(400, "Squad must contain at least 1 all-rounder.");
  }
  if (bowlers < 3) {
    throw new ApiError(400, "Squad must contain at least 3 bowlers.");
  }
  if (captainCount !== 1) {
    throw new ApiError(400, "Squad must contain exactly 1 captain.");
  }


  // check if squad already exists
  const existingSquad = await PlayingSquad.findOne({tournamentId, matchId, teamId});
  if (existingSquad) {
    throw new ApiError(400, "Playing squad already exists for this match.");
  }

  // save playing squad 
  const playingSquad = await PlayingSquad.create({
    tournamentId,
    matchId,
    teamId,
    players,
    captain: isCaptain
  });

  if(!playingSquad){
    throw new ApiError(500, "playing squad creation failed")
  };

  // return response 
  return res.status(201).json(
    new ApiResponse(
        201,
    playingSquad,
    "Playing squad created successfully"
    )
  )

});