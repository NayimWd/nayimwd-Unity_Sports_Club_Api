import { Match } from "../../models/matchModel/match.model";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { VenueBooking } from "../../models/venueModel/venueBooking.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import mongoose from "mongoose";

export const deleteSchedule = asyncHandler(async (req, res) => {
  const author = (req as any).user;

  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to change the schedule");
  }
  // validate admin
  const { scheduleId } = req.params;

  if (!scheduleId) {
    throw new ApiError(400, "Please provide a valid schedule ID.");
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const schedule = await Schedule.findById(scheduleId)
        .select("venueId matchDate matchTime matchId status")
        .session(session);

      if (!schedule) {
        throw new ApiError(404, "Schedule not found");
      }

      if (["in-progress", "completed"].includes(schedule.status)) {
        throw new ApiError(
          400,
          "Cannot delete a schedule for an in-progress or completed match."
        );
      }

      await Promise.all([
        VenueBooking.deleteOne(
          {
            venueId: schedule.venueId,
            bookingDate: schedule.matchDate,
            startTime: schedule.matchTime,
          },
          { session }
        ),

        schedule.matchId
          ? Match.deleteOne({ _id: schedule.matchId }, { session })
          : Promise.resolve(),

        Schedule.deleteOne({ _id: scheduleId }, { session }),
      ]);
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Schedule deleted successfully."));
  } finally {
    await session.endSession();
  }
});
