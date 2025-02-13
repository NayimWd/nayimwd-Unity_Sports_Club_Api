import { Schedule } from "../../models/sceduleModel/schedules.model";
import { Venue } from "../../models/venueModel/venue.model";
import { VenueBooking } from "../../models/venueModel/venueBooking.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const updateDetails = asyncHandler(async (req, res) => {
   // Authentication
   const author = (req as any).user;

   // Check if the user is an admin or staff
   if (!author || !["admin", "staff"].includes(author.role)) {
     throw new ApiError(403, "You are not authorized to update the schedule");
   }
 
   // Get the schedule ID and new values
   const { scheduleId } = req.params;
   const { newVenueId, newRound } = req.body;
 
   // Check if schedule ID is provided
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
 
   // **Prevent round change if match is already in progress or completed**
   if (["in-progress", "completed"].includes(schedule.status) && newRound) {
     throw new ApiError(400, "Cannot change the round after the match has started.");
   }
 
   // **Handle venue update**
   if (newVenueId) {
     // Check if new venue exists
     const venueExists = await Venue.findById(newVenueId);
     if (!venueExists) {
       throw new ApiError(404, "Venue does not exist.");
     }
 
     // **Check for venue booking conflicts**
     const venueConflict = await VenueBooking.findOne({
       venueId: newVenueId,
       bookingDate: schedule.matchDate,
       $or: [
         { startTime: { $lte: schedule.matchTime }, endTime: { $gt: schedule.matchTime } },
         { startTime: schedule.matchTime }
       ],
     });
 
     if (venueConflict) {
       throw new ApiError(400, "Venue is already booked for this date and time.");
     }
 
     // **Remove old venue booking**
     await VenueBooking.findOneAndDelete({
       venueId: schedule.venueId,
       bookingDate: schedule.matchDate,
       startTime: schedule.matchTime,
     });
 
     // **Book new venue**
     await VenueBooking.create({
       venueId: newVenueId,
       bookedBy: author._id,
       bookingDate: schedule.matchDate,
       startTime: schedule.matchTime,
       endTime: schedule.matchTime, // Assuming matchTime is a single time slot
     });
 
     // **Update venue in schedule**
     schedule.venueId = newVenueId;
   }
 
   // **Update round**
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
