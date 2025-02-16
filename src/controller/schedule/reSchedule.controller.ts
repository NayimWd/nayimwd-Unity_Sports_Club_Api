import { Match } from "../../models/matchModel/match.model";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { VenueBooking } from "../../models/venueModel/venueBooking.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const reSchedule = asyncHandler(async (req, res) => {
  // Authentication
  const author = (req as any).user;
  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to change the schedule");
  }

  // Extract parameters
  const { scheduleId } = req.params;
  const { newMatchDate, newMatchTime, newEndTime } = req.body;

  // Validate inputs
  if (!scheduleId || !newMatchDate || !newMatchTime || !newEndTime) {
    throw new ApiError(400, "Please provide schedule ID, new match date, new match time, and new end time.");
  }

  // Find the schedule
  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) {
    throw new ApiError(404, "Schedule not found");
  }

  // Find the related match
  const match = await Match.findById(schedule.matchId);
  if (!match) {
    throw new ApiError(404, "Match not found");
  }

  // ❌ Prevent rescheduling if the match is already in progress or completed
  if (["live", "completed"].includes(match.status)) {
    throw new ApiError(400, "Cannot reschedule a match that is live or completed.");
  }

  // **Check for venue conflicts**
  const conflictingBooking = await VenueBooking.findOne({
    venueId: schedule.venueId,
    bookingDate: newMatchDate,
    $or: [
      { startTime: { $lt: newEndTime, $gte: newMatchTime } },
      { endTime: { $gt: newMatchTime, $lte: newEndTime } },
      { startTime: { $lte: newMatchTime }, endTime: { $gte: newEndTime } },
    ],
  });

  if (conflictingBooking) {
    throw new ApiError(400, "Venue is already booked for the given date and time.");
  }

  // **Check if another match is already scheduled at this time in this venue**
  const existingSchedule = await Schedule.findOne({
    venueId: schedule.venueId,
    matchDate: newMatchDate,
    matchTime: newMatchTime,
    _id: { $ne: scheduleId },
  });

  if (existingSchedule) {
    throw new ApiError(400, "Another match is already scheduled at this venue at the same time.");
  }

  // **Check if teams are already scheduled for another match on this date**
  const existingTeamSchedule = await Schedule.findOne({
    $or: [
      { "teams.teamA": schedule.teams.teamA },
      { "teams.teamA": schedule.teams.teamB },
      { "teams.teamB": schedule.teams.teamA },
      { "teams.teamB": schedule.teams.teamB },
    ],
    matchDate: newMatchDate,
    _id: { $ne: scheduleId },
  });

  if (existingTeamSchedule) {
    throw new ApiError(400, "One or both teams are already scheduled for another match on this date.");
  }

  // ❌ Cancel old venue booking
  await VenueBooking.findOneAndDelete({
    venueId: schedule.venueId,
    bookingDate: schedule.matchDate,
    startTime: schedule.matchTime,
  });

  // ✅ Book new venue
  await VenueBooking.create({
    venueId: schedule.venueId,
    bookedBy: author._id,
    bookingDate: newMatchDate,
    startTime: newMatchTime,
    endTime: newEndTime,
  });

  // ✅ Update the schedule
  schedule.matchDate = newMatchDate;
  schedule.matchTime = newMatchTime;
  schedule.status = "rescheduled";
  await schedule.save();

  // ✅ Update match status to "upcoming" (in case it was set to "scheduled")
  match.status = "upcoming";
  await match.save();

  // Return response
  res.status(200).json(new ApiResponse(200, schedule, "Match rescheduled successfully"));
});
