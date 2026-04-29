import mongoose from "mongoose";
import { Match } from "../../models/matchModel/match.model";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { VenueBooking } from "../../models/venueModel/venueBooking.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const reSchedule = asyncHandler(async (req, res) => {
  // validate author
  const author = (req as any).user;

  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to change the schedule");
  }
  // get schedule id and math date and time
  const { scheduleId } = req.params;
  const { newMatchDate, newMatchTime, newEndTime } = req.body;

  if (!scheduleId || !newMatchDate || !newMatchTime || !newEndTime) {
    throw new ApiError(
      400,
      "Please provide schedule ID, new match date, new match time, and new end time."
    );
  }

  const session = await mongoose.startSession();

  try {
    let updatedSchedule: any;

    await session.withTransaction(async () => {
      // validate schedule and match
      const schedule = await Schedule.findById(scheduleId)
        .select("matchId venueId matchDate matchTime teams status")
        .session(session);

      if (!schedule) {
        throw new ApiError(404, "Schedule not found");
      }

      const match = await Match.findById(schedule.matchId)
        .select("status")
        .session(session);

      if (!match) {
        throw new ApiError(404, "Match not found");
      }

      if (["live", "completed"].includes(match.status)) {
        throw new ApiError(
          400,
          "Cannot reschedule a match that is live or completed."
        );
      }
      // check and prevent conflict
      const [venueConflict, existingSchedule, existingTeamSchedule] =
        await Promise.all([
          VenueBooking.exists({
            venueId: schedule.venueId,
            bookingDate: newMatchDate,
            $or: [
              { startTime: { $lt: newEndTime, $gte: newMatchTime } },
              { endTime: { $gt: newMatchTime, $lte: newEndTime } },
              {
                startTime: { $lte: newMatchTime },
                endTime: { $gte: newEndTime },
              },
            ],
          }).session(session),

          Schedule.exists({
            venueId: schedule.venueId,
            matchDate: newMatchDate,
            matchTime: newMatchTime,
            _id: { $ne: scheduleId },
          }).session(session),

          Schedule.exists({
            matchDate: newMatchDate,
            _id: { $ne: scheduleId },
            $or: [
              {
                "teams.teamA": {
                  $in: [schedule.teams.teamA, schedule.teams.teamB],
                },
              },
              {
                "teams.teamB": {
                  $in: [schedule.teams.teamA, schedule.teams.teamB],
                },
              },
            ],
          }).session(session),
        ]);

      if (venueConflict) {
        throw new ApiError(
          400,
          "Venue is already booked for the given date and time."
        );
      }

      if (existingSchedule) {
        throw new ApiError(
          400,
          "Another match is already scheduled at this venue at the same time."
        );
      }

      if (existingTeamSchedule) {
        throw new ApiError(
          400,
          "One or both teams are already scheduled for another match on this date."
        );
      }
      // update venue booking
      await VenueBooking.updateOne(
        {
          venueId: schedule.venueId,
          bookingDate: schedule.matchDate,
          startTime: schedule.matchTime,
          bookedBy: author._id,
        },
        {
          $set: {
            bookingDate: newMatchDate,
            startTime: newMatchTime,
            endTime: newEndTime,
          },
        },
        { session }
      );

      await Schedule.updateOne(
        { _id: scheduleId },
        {
          $set: {
            matchDate: newMatchDate,
            matchTime: newMatchTime,
            status: "rescheduled",
          },
        },
        { session }
      );

      await Match.updateOne(
        { _id: schedule.matchId },
        { $set: { status: "upcoming" } },
        { session }
      );

      await Schedule.findById(scheduleId).lean().session(session);
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Match rescheduled successfully"));
  } finally {
    await session.endSession();
  }
});
