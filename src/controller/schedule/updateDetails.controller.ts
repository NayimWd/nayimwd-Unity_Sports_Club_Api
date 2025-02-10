import { Schedule } from "../../models/sceduleModel/schedules.model";
import { Venue } from "../../models/venueModel/venue.model";
import { VenueBooking } from "../../models/venueModel/venueBooking.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const updateDetails = asyncHandler(async (req, res) => {
  // authentication
  const author = (req as any).user;

  // check if the user is an admin or staff
  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to update the schedule");
  }

  // get the schedule id and new values from the request params and body
  const { scheduleId } = req.params;
  const { newVenueId, newRound } = req.body;

  // check if schedule ID is provided
  if (!scheduleId) {
    throw new ApiError(400, "Please provide a valid schedule ID.");
  }

  // Find the schedule
  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) {
    throw new ApiError(404, "Schedule not found");
  }

  // Allowed rounds
  const allowedRounds = [
    "round 1",
    "round 2",
    "Quarter-Final",
    "Semi-Final",
    "Final",
    "Playoff",
  ];

  // Validate round
  if (newRound && !allowedRounds.includes(newRound)) {
    throw new ApiError(400, "Invalid round value.");
  }

  // Validate venue if provided
  if (newVenueId) {
    const venueExists = await Venue.findById(newVenueId);
    if (!venueExists) {
      throw new ApiError(404, "Venue does not exist.");
    }

    // Check if the venue is already booked at the same date and time
    const venueConflict = await VenueBooking.findOne({
      venueId: newVenueId,
      bookingDate: schedule.matchDate,
      $or: [{ startTime: schedule.matchTime }, { endTime: schedule.matchTime }],
    });

    if (venueConflict) {
      throw new ApiError(
        400,
        "Venue is already booked for this date and time."
      );
    }

    // Update venue
    schedule.venueId = newVenueId;
  }

  // Update round
  if (newRound) {
    schedule.round = newRound;
  }

  // Save the updated schedule
  await schedule.save();

  // Return response
  res
    .status(200)
    .json(new ApiResponse(200, null, "Schedule details updated successfully"));
});
