import moment from "moment";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { Venue } from "../../models/venueModel/venue.model";
import { VenueBooking } from "../../models/venueModel/venueBooking.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const updateDetails = asyncHandler(async (req, res) => {
  // Authentication
  const author = (req as any).user;

  if (!author || !["admin", "staff"].includes(author.role)) {
      throw new ApiError(403, "You are not authorized to update the schedule.");
  }

  // Get schedule ID and new values
  const { scheduleId } = req.params;
  const { newVenueId, newRound } = req.body;

  if (!scheduleId) {
      throw new ApiError(400, "Please provide a valid schedule ID.");
  }

  // Find the schedule
  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) {
      throw new ApiError(404, "Schedule not found.");
  }

  // Allowed rounds
  const allowedRounds = ["round 1", "round 2", "Quarter-Final", "Semi-Final", "Final", "Playoff"];

  if (newRound && !allowedRounds.includes(newRound)) {
      throw new ApiError(400, "Invalid round value.");
  }

  // Prevent round change if the match has started or completed
  if (["in-progress", "completed"].includes(schedule.status) && newRound) {
      throw new ApiError(400, "Cannot change the round after the match has started.");
  }

  /*** Handle Venue Update ***/
  if (newVenueId) {
      const venueExists = await Venue.findById(newVenueId);
      if (!venueExists) {
          throw new ApiError(404, "Venue does not exist.");
      }

      // Convert `matchTime` to moment format
      const matchStart = moment(schedule.matchTime, "hA"); // hA = 9AM, 3PM, etc.

      // Fetch match duration from the Tournament model
      const tournament = await Tournament.findById(schedule.tournamentId);
      if (!tournament) {
          throw new ApiError(404, "Tournament not found.");
      }

      // Calculate `endTime` based on `matchOver`
      const matchDuration = tournament.matchOver * 4; // Assuming 4 minutes per over (adjust as needed)
      const endTime = matchStart.clone().add(matchDuration, "minutes").format("hA");

      // **Check for venue booking conflicts**
      const venueConflict = await VenueBooking.findOne({
          venueId: newVenueId,
          bookingDate: schedule.matchDate,
          $or: [
              { startTime: { $lte: schedule.matchTime }, endTime: { $gt: schedule.matchTime } }, // Overlapping booking
              { startTime: schedule.matchTime }
          ],
      });

      if (venueConflict) {
          throw new ApiError(400, "Venue is already booked for this date and time.");
      }

      // **Remove old venue booking (Only if booked by the same user)**
      await VenueBooking.findOneAndDelete({
          venueId: schedule.venueId,
          bookingDate: schedule.matchDate,
          startTime: schedule.matchTime,
          endTime: endTime,
          bookedBy: author._id,
      });

      // **Book new venue**
      await VenueBooking.create({
          venueId: newVenueId,
          bookedBy: author._id,
          bookingDate: schedule.matchDate,
          startTime: schedule.matchTime,
          endTime: endTime,
      });

      // **Update venue in schedule**
      schedule.venueId = newVenueId;
  }

  /*** Update Round ***/
  if (newRound) {
      schedule.round = newRound;
  }

  // Save the updated schedule
  await schedule.save();

  // Return response
  res.status(200).json(
      new ApiResponse(200, null, "Schedule details updated successfully.")
  );
});
