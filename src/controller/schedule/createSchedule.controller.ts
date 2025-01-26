import { Schedule } from "../../models/sceduleModel/schedules.model";
import { Team } from "../../models/teamModel/teams.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { Venue } from "../../models/venueModel/venue.model";
import { VenueBooking } from "../../models/venueModel/venueBooking.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const createSchedule = asyncHandler(async (req, res) => {
  // authorize
  const author = (req as any).user;
  if (!author) {
    throw new ApiError(401, "Invalid token, please login");
  }

  if (!["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not admin or staff");
  }

  // get date from req body and params
  const { tournamentId } = req.params;
  const { venueId, round, teamA, teamB, matchDate, matchTime, endTime } =
    req.body;

  if (
    !tournamentId ||
    !venueId ||
    !round ||
    !teamA ||
    !teamB ||
    !matchDate ||
    !matchTime ||
    !endTime
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // find if tournament exists
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }

  // find if venue exists
  const venue = await Venue.findById(venueId);
  if (!venue) {
    throw new ApiError(404, "Venue not found");
  }

  // check if venue booking conflict
  const conflictingBooking = await VenueBooking.findOne({
    venueId,
    bookingDate: matchDate,
    $or: [
      {
        startTime: { $lt: endTime, $gte: matchTime },
      },
      {
        endTime: { $gt: matchTime, $lte: endTime },
      },
    ],
  });

  // validate team IDs
  // check if both are same
  if (teamA.toString() === teamB.toString()) {
    throw new ApiError(400, "Team A and Team B can not the same");
  }

  // check if team exists
  const teamExist = await Team.find({
    _id: { $in: [teamA, teamB] },
  }).countDocuments();
  if (teamExist !== 2) {
    throw new ApiError(404, "One or both teams do not exist or wrong team ID");
  }

  if (conflictingBooking) {
    throw new ApiError(400, "Venue is already booked in that date and time");
  }

  // check if schedule already exist
  const existingSchedule = await Schedule.findOne({
    venueId,
    matchDate,
    matchTime,
  });

  if (existingSchedule) {
    throw new ApiError(
      400,
      "A match is already scheduled at this venue, date, and time."
    );
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
    throw new ApiError(500, "Venue Booking failed");
  }

  // create a schedule
  // get existing match number of schedule
  const matchNumberCount =
    (await Schedule.countDocuments({ tournamentId })) + 1;

  const newSchedule = await Schedule.create({
    tournamentId,
    venueId,
    matchNumber: matchNumberCount,
    round,
    teams: {
      teamA,
      teamB,
    },
    matchDate,
    matchTime,
    status: "scheduled",
  });

  if (!newSchedule) {
    throw new ApiError(500, "New schedule creation failed");
  }

  // return response
  return res.status(201).json(
    new ApiResponse(
      201,
      {
        venue: createdVenueBooking,
        schedule: newSchedule,
      },
      "Schedule created successfully"
    )
  );
});
