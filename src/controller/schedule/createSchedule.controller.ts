import { Schedule } from "../../models/sceduleModel/schedules.model";
import { Team } from "../../models/teamModel/teams.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { Venue } from "../../models/venueModel/venue.model";
import { VenueBooking } from "../../models/venueModel/venueBooking.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const createSchedule = asyncHandler(async (req, res) => {
  // authenticate
  const author = (req as any).user;
  // validate
  if (!author) {
    throw new ApiError(401, "Invalid token, please login");
  }

  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to create a schedule");
  }
  // get data from req params and body
  const { tournamentId } = req.params;
  const { venueId, round, teamA, teamB, matchNumber, matchDate, matchTime, endTime } =
    req.body;
  // validate
  if (
    !tournamentId ||
    !venueId ||
    !round ||
    !teamA ||
    !teamB ||
    !matchDate ||
    !matchNumber ||
    !matchTime ||
    !endTime
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Validate IDs and fetch required data in parallel
  const [tournament, venue, teamCount] = await Promise.all([
    Tournament.findById(tournamentId),
    Venue.findById(venueId),
    Team.countDocuments({ _id: { $in: [teamA, teamB] } }),
  ]);

  // validate
  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }

  if (!venue) {
    throw new ApiError(404, "Venue not found");
  }

  if (teamA.toString() === teamB.toString()) {
    throw new ApiError(400, "Team A and Team B cannot be the same");
  }

  if (teamCount !== 2) {
    throw new ApiError(404, "One or both teams do not exist");
  }

  // check team already scheduled

  // Check for conflicts
  const [conflictingBooking, existingSchedule] = await Promise.all([
    VenueBooking.findOne({
      venueId,
      bookingDate: matchDate,
      $or: [
        { startTime: { $lt: endTime, $gte: matchTime } },
        { endTime: { $gt: matchTime, $lte: endTime } },
      ],
    }),
    Schedule.findOne({ venueId, matchDate, matchTime }),
  ]);

  if (conflictingBooking) {
    throw new ApiError(
      400,
      "Venue is already booked for the given date and time"
    );
  }

  if (existingSchedule) {
    throw new ApiError(
      400,
      "A match is already scheduled at this venue, date, and time"
    );
  }

  // check existing team schedule
  const existingTeamSchedule = await Schedule.findOne({
    teams: { $in: [teamA, teamB] },
  });

  if (existingTeamSchedule) {
    throw new ApiError(400, "One or both teams are already scheduled");
  }

  // Create venue booking
  const createdVenueBooking = await VenueBooking.create({
    venueId,
    bookedBy: author._id,
    bookingDate: matchDate,
    startTime: matchTime,
    endTime,
  });

  if (!createdVenueBooking) {
    throw new ApiError(500, "Failed to book the venue");
  }

  // Create schedule
  // const matchNumber = (await Schedule.countDocuments({ tournamentId })) + 1;

  const newSchedule = await Schedule.create({
    tournamentId,
    venueId,
    matchNumber,
    round,
    teams: { teamA, teamB },
    matchDate,
    matchTime,
    status: "scheduled",
  });

  if (!newSchedule) {
    throw new ApiError(500, "Failed to create the schedule");
  }

  // Send response
  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { venue: createdVenueBooking, schedule: newSchedule },
        "Schedule created successfully"
      )
    );
});
