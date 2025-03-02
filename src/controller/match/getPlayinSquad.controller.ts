import { PlayingSquad } from "../../models/matchModel/playingSquad.model";
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
        .populate({
            path: "players",
            select: "name player_role", // Populate player name and role
        })
        .populate({
            path: "captain",
            select: "name", // Populate captain name
        });

    if (!playingSquad) {
        throw new ApiError(404, "Playing squad not found.");
    };

    return res.status(200).json(new ApiResponse(200, playingSquad, "Playing squad retrieved successfully"));
})