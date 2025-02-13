import { Match } from "../../models/matchModel/match.model";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { Team } from "../../models/teamModel/teams.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { Venue } from "../../models/venueModel/venue.model";
import { VenueBooking } from "../../models/venueModel/venueBooking.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const createSchedule = asyncHandler(async (req, res) => {
   // Authenticate user
   const author = req.user;
   if (!author || !["admin", "staff"].includes(author.role)) {
     throw new ApiError(403, "You are not authorized to create a schedule");
   }
 
   // Extract data from request
   const {
     tournamentId,
     matchNumber,
     round,
     venueId,
     matchDate,
     matchTime,
     teamA,
     teamB,
     previousMatches,
   } = req.body;
 
   if (!tournamentId || !matchNumber || !round || !venueId || !matchDate || !matchTime) {
     throw new ApiError(400, "Missing required fields");
   }
 
   // Validate tournament
   const tournament = await Tournament.findById(tournamentId);
   if (!tournament) {
     throw new ApiError(404, "Tournament not found");
   }
 
   // Ensure no duplicate match in schedule
   const existingSchedule = await Schedule.findOne({ tournamentId, matchNumber });
   if (existingSchedule) {
     throw new ApiError(400, `Match ${matchNumber} is already scheduled for this tournament`);
   }
 
   // Ensure venue is available for booking
   const venueConflict = await Schedule.findOne({ venueId, matchDate, matchTime });
   if (venueConflict) {
     throw new ApiError(400, "Venue is already booked at this date and time");
   }
 
   // Check and book the venue
   const venueBooking = await VenueBooking.findOneAndUpdate(
     { venueId, bookingDate: matchDate, startTime: matchTime },
     { $setOnInsert: { bookedBy: author._id } },
     { upsert: true, new: true }
   );
 
   if (!venueBooking) {
     throw new ApiError(500, "Failed to book the venue");
   }
 
   let teams = {};
   let previousMatchRefs = {};
 
   // First Round: Assign actual teams
   if (round === "round 1") {
     if (!teamA || !teamB) {
       throw new ApiError(400, "TeamA and TeamB are required for round 1 matches");
     }
     teams = { teamA, teamB };
   } else {
     // Later Rounds: Use match references
     if (!previousMatches || !previousMatches.matchA || !previousMatches.matchB) {
       throw new ApiError(400, "Previous match references are required for later rounds");
     }
 
     // Ensure previous matches exist
     const matchA = await Match.findById(previousMatches.matchA);
     const matchB = await Match.findById(previousMatches.matchB);
     if (!matchA || !matchB) {
       throw new ApiError(404, "One or both previous matches not found");
     }
 
     previousMatchRefs = { matchA: matchA._id, matchB: matchB._id };
   }
 
   // Create Schedule
   const newSchedule = await Schedule.create({
     tournamentId,
     matchNumber,
     round,
     venueId,
     matchDate,
     matchTime,
     teams,
     previousMatches: previousMatchRefs,
     status: "scheduled",
   });
 
   res.status(201).json(new ApiResponse(201, newSchedule, "Schedule created successfully"));
});
