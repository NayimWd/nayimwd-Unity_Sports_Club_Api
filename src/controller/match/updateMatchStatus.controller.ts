import { Match } from "../../models/matchModel/match.model";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

// Allowed status transitions
const validStatusTransitions: Record<string, string[]> = {
    scheduled: ["in-progress", "cancelled"],
    "in-progress": ["completed", "cancelled"],
    completed: [], // No further updates allowed
    cancelled: [], // No further updates allowed
  };
  

export const updateMatchStatus = asyncHandler(async (req, res) => {
    // authenticate user
    const author = (req as any).user;
    if (!author || !["admin", "staff"].includes(author.role)) {
        throw new ApiError(403, "You are not authorized to update match status");
    };

    // extract data from request
    const { tournamentId , matchId } = req.params;
    const { newStatus } = req.body;

    // validate inputs
    if (!tournamentId || !matchId || !newStatus) {
        throw new ApiError(400, "Please provide tournament ID, match ID and status");
    };

    if(!["scheduled", "in-progress", "completed", "cancelled"].includes(newStatus)) {
        throw new ApiError(400, "Invalid status provided");
    }

    // check if the tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
        throw new ApiError(404, "Tournament not found");
    }

    // check if the match exists
    const match = await Match.findOne({_id: matchId, tournamentId});
    if (!match) {
        throw new ApiError(404, "Match not found");
    }

    // check if the status transition is valid
    const allowedTransitions = validStatusTransitions[match.status];
    if(!allowedTransitions.includes(newStatus)) {
        throw new ApiError(400, `Invalid status transition from ${match.status} to ${newStatus}`);
    };

    // fetch schedule
    const schedule = await Schedule.findOne({matchId});
    if(!schedule) {
        throw new ApiError(404, "Schedule not found");
    };

    // update match and schedule status
    match.status = newStatus;
    schedule.status = newStatus;
    
    await Promise.all([match.save(), schedule.save()]);

    // return response
    return res.status(200).json(
        new ApiResponse(200, {status: match.status}, "Match status updated successfully")
    )
});