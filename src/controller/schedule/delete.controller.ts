import { Match } from "../../models/matchModel/match.model";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { VenueBooking } from "../../models/venueModel/venueBooking.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const deleteSchedule = asyncHandler(async (req, res) => {
  // Authentication
  const author = (req as any).user;

  // Check if the user is an admin or staff
  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to delete the schedule");
  }

  // Get the schedule ID from the request params
  const { scheduleId } = req.params;

  // Validate input
  if (!scheduleId) {
    throw new ApiError(400, "Please provide a valid schedule ID.");
  }

  // Find the schedule
  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) {
    throw new ApiError(404, "Schedule not found");
  }

  //  Prevent deletion if match is already in progress or completed
  if (["in-progress", "completed"].includes(schedule.status)) {
    throw new ApiError(
      400,
      "Cannot delete a schedule for an in-progress or completed match."
    );
  }

  // Cancel venue booking
  await VenueBooking.findOneAndDelete({
    venueId: schedule.venueId,
    bookingDate: schedule.matchDate,
    startTime: schedule.matchTime,
  });

  //  Check if there is a match linked to this schedule and delete it
  if (schedule.matchId) {
    await Match.findByIdAndDelete(schedule.matchId);
  }

  // Delete the schedule
  await Schedule.findByIdAndDelete(scheduleId);

  // Return response
  res
    .status(200)
    .json(new ApiResponse(200, null, "Schedule deleted successfully."));
});
