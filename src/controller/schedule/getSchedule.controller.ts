import { Schedule } from "../../models/sceduleModel/schedules.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
 
export const getSchedules = asyncHandler(async (req, res) => {
  // get tournament id and optional team id from the request params
  const { tournamentId } = req.params;
  const { teamId } = req.query;

  // validate
  if (!tournamentId) {
    throw new ApiError(400, "Please provide a valid tournament ID.");
  }

  // query filter
  const filter: any = { tournamentId };
  if (teamId) {
    filter.$or = [{ "teams.teamA": teamId }, { "teams.teamB": teamId }];
  }

  // fetch schedules with populate team details and venue
  const schedules = await Schedule.find(filter)
    .populate("teams.teamA", "teamName teamLogo")
    .populate("teams.teamB", "teamName teamLogo")
    .populate("venueId", "venueName")
    .sort({ matchDate: 1, matchTime: 1 });

  // send response
  res
    .status(200)
    .json(new ApiResponse(200, schedules, "Schedules fetched successfully"));
});
