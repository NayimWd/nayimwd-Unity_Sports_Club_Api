import { Match } from "../../models/matchModel/match.model";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { Team } from "../../models/teamModel/teams.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const changeTeams = asyncHandler(async (req, res) => {
  // Authentication
  const author = (req as any).user;

  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to change the schedule.");
  }

  // Get schedule ID, new teams, and new match reference from request
  const { scheduleId } = req.params;
  const { newTeamA, newTeamB, newMatchId } = req.body;

  // Validate input
  if (!scheduleId) {
    throw new ApiError(400, "Please provide a valid schedule ID.");
  }

  // Find the schedule
  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) {
    throw new ApiError(404, "Schedule not found.");
  }

  // Find the related match
  const match = await Match.findById(schedule.matchId);
  if (!match) {
    throw new ApiError(404, "Match not found.");
  }

  // ❌ Prevent changes if the match is in progress or completed
  if (["live", "completed"].includes(match.status)) {
    throw new ApiError(400, "Cannot change teams for a match that is live or completed.");
  }

  // Ensure at least one new team or a new match reference is provided
  if (!newTeamA && !newTeamB && !newMatchId) {
    throw new ApiError(400, "Provide at least one team or a new match reference to update.");
  }

  // Store existing teams for reference
  const updatedTeamA = newTeamA || schedule.teams.teamA;
  const updatedTeamB = newTeamB || schedule.teams.teamB;

  // Ensure Team A and Team B are not the same
  if (updatedTeamA.toString() === updatedTeamB.toString()) {
    throw new ApiError(400, "Team A and Team B cannot be the same.");
  }

  // Validate teams only if they are provided
  const teamIds = [updatedTeamA, updatedTeamB].filter((id) => id); // Remove `undefined`
  const validTeams = await Team.countDocuments({ _id: { $in: teamIds } });

  if (validTeams !== teamIds.length) {
    throw new ApiError(404, "One or both teams do not exist.");
  }

  // **Check if teams are already scheduled on the same date**
  const conflictingMatch = await Schedule.findOne({
    matchDate: schedule.matchDate,
    _id: { $ne: scheduleId }, // Exclude current schedule
    $or: [
      { "teams.teamA": updatedTeamA },
      { "teams.teamA": updatedTeamB },
      { "teams.teamB": updatedTeamA },
      { "teams.teamB": updatedTeamB },
    ],
  });

  if (conflictingMatch) {
    throw new ApiError(400, "One or both new teams are already scheduled on this date.");
  }

  // **If a new match reference is provided, validate it**
  if (newMatchId) {
    const matchExists = await Match.findById(newMatchId);
    if (!matchExists) {
      throw new ApiError(404, "Provided match ID does not exist.");
    }

    // Ensure the match is not already assigned to another schedule
    const existingMatchSchedule = await Schedule.findOne({
      matchId: newMatchId,
      _id: { $ne: scheduleId }, // Exclude current schedule
    });

    if (existingMatchSchedule) {
      throw new ApiError(400, "The new match is already assigned to another schedule.");
    }

    schedule.matchId = newMatchId;
  }

  // **Update teams and match reference**
  schedule.teams.teamA = updatedTeamA;
  schedule.teams.teamB = updatedTeamB;
  await schedule.save();

  // **Return response**
  res.status(200).json(new ApiResponse(200, schedule, "Schedule updated successfully."));
});
