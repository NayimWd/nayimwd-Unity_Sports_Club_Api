import mongoose from "mongoose";
import { Match } from "../../models/matchModel/match.model";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import moment from "moment";

export const updateStatus = asyncHandler(async (req, res) => {
  // validate user
  const author = (req as any).user;

  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to change the schedule");
  }
  // get schedule id and status
  const { scheduleId } = req.params;
  const { status } = req.body;

  if (!scheduleId || !status) {
    throw new ApiError(400, "Please provide schedule ID and status");
  }
  // valid status list
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
  // start session
  const session = await mongoose.startSession();

  try {
    let responseData: any;

    await session.withTransaction(async () => {
      // validate schedule by project only require data
      const schedule = await Schedule.findById(scheduleId)
        .select("matchId matchDate matchTime teams status")
        .lean()
        .session(session);

      if (!schedule) {
        throw new ApiError(404, "Schedule not found.");
      }
      // validate match
      const match = await Match.findById(schedule.matchId)
        .select("status teamA teamB")
        .lean()
        .session(session);

      if (!match) {
        throw new ApiError(404, "Match not found.");
      }

      if (match.status === "completed") {
        throw new ApiError(400, "Cannot update a completed match.");
      }
      // allow field for each status
      const allowedTransitions: Record<string, string[]> = {
        scheduled: ["scheduled", "rescheduled", "in-progress", "cancelled"],
        rescheduled: ["scheduled", "in-progress", "cancelled"],
        "in-progress": ["completed"],
        cancelled: ["rescheduled"],
        completed: [],
      };

      if (!allowedTransitions[match.status]?.includes(status)) {
        throw new ApiError(
          400,
          `Invalid status transition from ${match.status} to ${status}`
        );
      }
      // format time and get current time
      const matchStart = moment(
        `${schedule.matchDate} ${schedule.matchTime}`,
        "DD-MM-YYYY hA"
      );

      const now = moment();
      // validate timing
      if (now.isAfter(matchStart) && status === "scheduled") {
        throw new ApiError(
          400,
          "Cannot set status to scheduled after match time."
        );
      }

      if (now.isBefore(matchStart) && status === "in-progress") {
        throw new ApiError(400, "Match has not started yet.");
      }

      if (
        status === "in-progress" &&
        (!schedule.teams?.teamA || !schedule.teams?.teamB)
      ) {
        throw new ApiError(
          400,
          "Cannot start the match. Teams are not finalized."
        );
      }

      await Promise.all([
        Schedule.updateOne(
          { _id: scheduleId },
          { $set: { status } },
          { session }
        ),

        Match.updateOne(
          { _id: schedule.matchId },
          { $set: { status } },
          { session }
        ),
      ]);

      responseData = {
        scheduleStatus: status,
        matchStatus: status,
      };
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, responseData, "Match status updated successfully.")
      );
  } finally {
    await session.endSession();
  }
});
