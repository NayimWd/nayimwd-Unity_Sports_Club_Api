import mongoose from "mongoose";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
 
export const getSchedules = asyncHandler(async (req, res) => {
  // Get tournament ID and optional team ID from the request params
  const { tournamentId } = req.params;
  const { teamId } = req.query;

  // Validate tournamentId
  if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
    throw new ApiError(400, "Invalid tournament ID.");
  }

  // Validate teamId (if provided)
  if (teamId && !mongoose.Types.ObjectId.isValid(teamId as string)) {
    throw new ApiError(400, "Invalid team ID.");
  }

  // Query filter
  const filter: any = { tournamentId };
  if (teamId) {
    filter.$or = [{ "teams.teamA": teamId }, { "teams.teamB": teamId }];
  }

  // Fetch schedules with populated team details and venue
  const schedules = await Schedule.find(filter)
    .select("-createdAt -updatedAt")
    .populate("teams.teamA", "teamName teamLogo")
    .populate("teams.teamB", "teamName teamLogo")
    .populate("venueId", "name")
    .sort({ matchDate: 1, matchTime: 1 });

  // Send response
  res.status(200).json(
    new ApiResponse(
      200,
      {
        total: schedules.length,
        schedules,
      },
      "Schedules fetched successfully."
    )
  );
});