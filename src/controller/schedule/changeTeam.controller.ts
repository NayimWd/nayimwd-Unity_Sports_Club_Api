import { Schedule } from "../../models/sceduleModel/schedules.model";
import { Team } from "../../models/teamModel/teams.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const changeTeams = asyncHandler(async (req, res) => {
  // authentication
  const author = (req as any).user;

  // check if the user is an admin or staff
  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to change the schedule");
  }

  // get the schedule id and teams from the request params and body
  const { scheduleId } = req.params;
  const { newTeamA, newTeamB } = req.body;

  // check if scheduleId is provided
  if (!scheduleId) {
    throw new ApiError(400, "Please provide a valid schedule ID.");
  }

  // find the schedule
  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) {
    throw new ApiError(404, "Schedule not found");
  }

  // Ensure at least one new team is provided
  if (!newTeamA && !newTeamB) {
    throw new ApiError(400, "Please provide at least one team to update.");
  }

  // Store existing teams for reference
  let updatedTeamA = newTeamA || schedule.teams.teamA;
  let updatedTeamB = newTeamB || schedule.teams.teamB;

  // check if both teams are the same
  if (updatedTeamA.toString() === updatedTeamB.toString()) {
    throw new ApiError(400, "Team A and Team B cannot be the same");
  }

  // Validate if the provided teams exist
  const validTeams = await Team.countDocuments({
    _id: { $in: [updatedTeamA, updatedTeamB] },
  });

  if (validTeams !== 2) {
    throw new ApiError(404, "One or both teams do not exist");
  }

  // Check if the new team is already scheduled in another match at the same time
  const conflictingMatch = await Schedule.findOne({
    matchDate: schedule.matchDate,
    matchTime: schedule.matchTime,
    $or: [
      { "teams.teamA": { $in: [updatedTeamA, updatedTeamB] } },
      { "teams.teamB": { $in: [updatedTeamA, updatedTeamB] } },
    ],
    _id: { $ne: scheduleId }, // Exclude current schedule
  });

  if (conflictingMatch) {
    throw new ApiError(
      400,
      "One or both new teams are already scheduled at this time"
    );
  }

  // Update the teams
  schedule.teams.teamA = updatedTeamA;
  schedule.teams.teamB = updatedTeamB;
  await schedule.save();

  // return response
  res
    .status(200)
    .json(new ApiResponse(200, null, "Schedule teams updated successfully"));
});
