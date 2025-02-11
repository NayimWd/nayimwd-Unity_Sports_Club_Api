import { Schedule } from "../../models/sceduleModel/schedules.model";
import { VenueBooking } from "../../models/venueModel/venueBooking.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const reSchedule = asyncHandler(async (req, res) => {
  // authentication
  const author = (req as any).user;
  // check if the user is an admin or staff
  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to change the schedule");
  }

  // get matchId and date time from the request params and body
  const { scheduleId } = req.params;
  const { newMatchDate, newMatchTime, newEndTime } = req.body;
  // validate
  if (!scheduleId || !newMatchDate || !newMatchTime || !newEndTime) {
    throw new ApiError(
      400,
      "Please provide match id, new match date, new match time and new end time"
    );
  }

  // find the schedule by id
  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) {
    throw new ApiError(404, "Schedule not found");
  }

  // check new schedule conflicts with existing schedules
  const [conflictingBooking, existingSchedule, existingTeamSchedule] =
    await Promise.all([
      VenueBooking.findOne({
        venueId: schedule.venueId,
        bookingDate: newMatchDate,
        $or: [
          {
            startTime: { $lt: newEndTime, $gte: newMatchTime },
          },
          {
            endTime: { $gt: newMatchTime, $lte: newEndTime },
          },
        ],
      }),
      Schedule.findOne({
        venueId: schedule.venueId,
        matchDate: newMatchDate,
        matchTime: newMatchTime,
        _id: { $ne: scheduleId },
      }),
      Schedule.findOne({
        "teams.teamA": { $in: [schedule.teams.teamA, schedule.teams.teamB] },
        "teams.teamB": { $in: [schedule.teams.teamA, schedule.teams.teamB] },
        matchDate: newMatchDate,
        matchTime: newMatchTime,
        _id: { $ne: scheduleId },
      }),
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
      "Another match is already scheduled at this venue at the same time"
    );
  }

  if (existingTeamSchedule) {
    throw new ApiError(
      400,
      "One or both teams are already scheduled at this time"
    );
  }

  // update the schedule
  schedule.matchDate = newMatchDate;
  schedule.matchTime = newMatchTime;
  await schedule.save();

  // return response
  res
    .status(200)
    .json(new ApiResponse(200, schedule, "Match rescheduled successfully"));
});
