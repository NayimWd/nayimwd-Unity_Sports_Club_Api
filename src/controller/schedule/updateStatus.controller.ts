import { Schedule } from "../../models/sceduleModel/schedules.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import moment from "moment";

export const updateStatus = asyncHandler(async(req, res)=>{
     // Authentication
     const author = (req as any).user;

     // Check if the user is an admin or staff
     if (!author || !["admin", "staff"].includes(author.role)) {
         throw new ApiError(403, "You are not authorized to change the schedule");
     }
 
     // Get schedule ID and status from request
     const { scheduleId } = req.params;
     const { status } = req.body;
 
     // Check if data is provided
     if (!scheduleId || !status) {
         throw new ApiError(400, "Please provide schedule ID and status");
     }
 
     // Valid status values
     const validStatus = ["scheduled", "rescheduled", "in-progress", "cancelled", "completed"];
     if (!validStatus.includes(status)) {
         throw new ApiError(400, "Invalid status");
     }
 
     // Find the schedule
     const schedule = await Schedule.findById(scheduleId);
     if (!schedule) {
         throw new ApiError(404, "Schedule not found");
     }
 
     // Convert match date and time to a moment object
     const matchStart = moment(`${schedule.matchDate} ${schedule.matchTime}`, "DD-MM-YYYY hA");
     const now = moment();
 
     // Prevent status changes for completed matches
     if (schedule.status === "completed") {
         throw new ApiError(400, "Cannot update a completed match.");
     }
 
     // Prevent invalid status transitions
     const allowedTransitions: Record<string, string[]> = {
         "scheduled": ["rescheduled", "in-progress", "cancelled"],
         "rescheduled": ["scheduled", "in-progress", "cancelled"],
         "in-progress": ["completed"],
         "cancelled": [],
         "completed": []
     };
 
     if (!allowedTransitions[schedule.status].includes(status)) {
         throw new ApiError(400, `Invalid status transition from ${schedule.status} to ${status}`);
     }
 
     // Time-based restrictions
     if (now.isAfter(matchStart) && status === "scheduled") {
         throw new ApiError(400, "Cannot set status to scheduled after match time.");
     }
 
     if (now.isBefore(matchStart) && status === "in-progress") {
         throw new ApiError(400, "Match has not started yet.");
     }
 
     // Update the status
     schedule.status = status;
     await schedule.save();
 
     // Return response
     res.status(200).json(
         new ApiResponse(200, schedule.status, "Schedule status updated")
     );
})