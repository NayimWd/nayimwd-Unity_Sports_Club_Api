import { Schedule } from "../../models/sceduleModel/schedules.model";
import { Team } from "../../models/teamModel/teams.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { Venue } from "../../models/venueModel/venue.model";
import { VenueBooking } from "../../models/venueModel/venueBooking.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const createSchedule = asyncHandler(async (req, res) => {
  const author = (req as any).user;
  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to create a schedule");
  }

  const { tournamentId } = req.params;
  const { venueId, round, matchNumber, matchDate, matchTime, endTime, teamA, teamB, matchA, matchB } = req.body;

  if (!tournamentId || !venueId || !round || !matchDate || !matchNumber || !matchTime || !endTime) {
    throw new ApiError(400, "All fields are required");
  }

  const [tournament, venue] = await Promise.all([
    Tournament.findById(tournamentId),
    Venue.findById(venueId),
  ]);

  if (!tournament) throw new ApiError(404, "Tournament not found");
  if (!venue) throw new ApiError(404, "Venue not found");

  let scheduleData: any = {
    tournamentId,
    venueId,
    matchNumber,
    round,
    matchDate,
    matchTime,
    status: "scheduled",
  };

  if (round === "round 1") {
    if (!teamA || !teamB) {
      throw new ApiError(400, "Teams are required for round 1 matches");
    }

    const teamCount = await Team.countDocuments({ _id: { $in: [teamA, teamB] } });
    if (teamCount !== 2) {
      throw new ApiError(404, "One or both teams do not exist");
    }

    scheduleData.teams = { teamA, teamB };
  } else {
    if (!matchA || !matchB) {
      throw new ApiError(400, `For ${round}, references to previous matches are required`);
    }

    scheduleData.previousMatches = { matchA, matchB };
  }

  const newSchedule = await Schedule.create(scheduleData);
  if (!newSchedule) throw new ApiError(500, "Failed to create the schedule");

  res.status(201).json(new ApiResponse(201, { schedule: newSchedule }, "Schedule created successfully"));
});
