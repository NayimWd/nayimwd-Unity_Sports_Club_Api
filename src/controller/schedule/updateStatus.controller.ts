import { Match } from "../../models/matchModel/match.model";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import moment from "moment";

export const updateStatus = asyncHandler(async (req, res) => {
  // Authentication
  const author = (req as any).user;

  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to change the schedule");
  }

  // Get schedule ID and new status from request
  const { scheduleId } = req.params;
  const { status } = req.body;

  if (!scheduleId || !status) {
    throw new ApiError(400, "Please provide schedule ID and status");
  }

  // Valid status values
  const validStatus = [
    "upcoming",
    "rescheduled",
    "in-progress",
    "cancelled",
    "completed",
  ];
  if (!validStatus.includes(status)) {
    throw new ApiError(400, "Invalid status value.");
  }

  // Find the schedule
  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) {
    throw new ApiError(404, "Schedule not found.");
  }

  // Find the associated match
  const match = await Match.findById(schedule.matchId);
  if (!match) {
    throw new ApiError(404, "Match not found.");
  }

  // Convert match date and time to a moment object
  const matchStart = moment(
    `${schedule.matchDate} ${schedule.matchTime}`,
    "DD-MM-YYYY hA"
  );
  const now = moment();

  // Prevent updates on completed matches
  if (match.status === "completed") {
    throw new ApiError(400, "Cannot update a completed match.");
  }

  //  Updated status transition rules to include "upcoming"
  const allowedTransitions: Record<string, string[]> = {
    scheduled: ["scheduled", "rescheduled", "in-progress", "cancelled"],
    rescheduled: ["scheduled", "in-progress", "cancelled"],
    "in-progress": ["completed"],
    cancelled: ["rescheduled"], //  Allow rescheduling a cancelled match
    completed: [],
  };

  if (!allowedTransitions[match.status]?.includes(status)) {
    throw new ApiError(
      400,
      `Invalid status transition from ${match.status} to ${status}`
    );
  }

  // Time-based restrictions
  if (now.isAfter(matchStart) && status === "scheduled") {
    throw new ApiError(400, "Cannot set status to scheduled after match time.");
  }

  if (now.isBefore(matchStart) && status === "in-progress") {
    throw new ApiError(400, "Match has not started yet.");
  }

  //  Prevent "in-progress" if teams are not finalized
  if (
    status === "in-progress" &&
    (!schedule.teams.teamA || !schedule.teams.teamB)
  ) {
    throw new ApiError(400, "Cannot start the match. Teams are not finalized.");
  }

  //  Update the status in both Schedule & Match
  schedule.status = status;
  match.status = status;

  await schedule.save();
  await match.save();

  //  Return response
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { scheduleStatus: schedule.status, matchStatus: match.status },
        "Match status updated successfully."
      )
    );
});
