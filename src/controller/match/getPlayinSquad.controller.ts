import { PlayingSquad } from "../../models/matchModel/playingSquad.model";
import { PlayerProfile } from "../../models/profilesModel/playerProfile.model";
import { TeamPlayer } from "../../models/teamModel/teamPlayer.model";
import { User } from "../../models/userModel/user.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const getPlayingSquad = asyncHandler(async(req, res)=>{
    const { tournamentId, matchId, teamId } = req.params;

    if (!tournamentId || !matchId || !teamId) {
        throw new ApiError(400, "Invalid request. Please provide tournamentId, matchId, and teamId.");
    }

    // fetch squad 
    const playingSquad = await PlayingSquad.findOne({ tournamentId, matchId, teamId })

    let playerIds: string[];

    if(playingSquad){
        // if playing squad exists, use player list
        playerIds = playingSquad.players.map((id)=> id.toString());
    } else {
         // If no playing squad, fetch all team players
         const teamPlayers = await TeamPlayer.find({teamId});
         playerIds = teamPlayers.map((player)=> player.playerId.toString());
    };

    // Fetch player details 
    const playerDetails = await Promise.all(
        playerIds.map(async(playerId)=>{
            const [user, profile] = await Promise.all([
                User.findById(playerId).select("name photo"),
                PlayerProfile.findOne({userId: playerId}).select("player_role")
            ]);

            return {
                _id: playerId,
                name: user?.name || "Unknown",
                photo: user?.photo || null,
                player_role: profile?.player_role || "Unknown"
            }
        })
    )

    // Format response
    const response = {
        _id: playingSquad?._id || null,
        tournamentId,
        matchId,
        teamId,
        captain: playingSquad ? playerDetails.find((player)=> player._id.toString() === playingSquad.captain._id.toString()) || null : null,
        players: playerDetails,
        isSquadFinalized: !!playingSquad,
    }

    return res.status(200).json(
        new ApiResponse(200, response, playingSquad ? "Playing squad retrieved successfully" : "No squad found, showing all team players")
    );

})