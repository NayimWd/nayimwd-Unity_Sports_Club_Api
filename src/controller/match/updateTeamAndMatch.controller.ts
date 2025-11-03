import { Match } from "../../models/matchModel/match.model";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const updateTeamAndMatch = asyncHandler(async (req, res) => {
  // authenticate and authorize user
  const author = (req as any).user;

  if (!author || !["admin", "staff"].includes(author.role())) {
    throw new ApiError(403, "You are not authorized to update match status");
  }

  // get Match Id and data
  const { matchId } = req.params;
  const {
    teamA: newTeamA,
    teamB: newTeamB,
    previousMatches: newPreviousMatches,
  } = req.body;

  // validate data
  if (!matchId) {
    throw new ApiError(400, "Match Id is required");
  }

  // find Match
  const match = await Match.findById(matchId);
  if (!match) {
    throw new ApiError(404, "Match not found");
  }

  // check match status
  if (["completed", "in-progress", "cancelled"].includes(match.status)) {
    throw new ApiError(
      400,
      `Match cannot be updated as it is already ${match.status}`
    );
  }

  // Find Associated Schedule
  const schedule = await Schedule.findOne({ matchId });
  if (!schedule) {
    throw new ApiError(
      404,
      "Schedule not found for this match. Cannot proceed with update."
    );
  }

  // Check If New Teams Are Already Scheduled Before This Match in Both Match & Schedule
  const teamConflict = await Promise.all([
    Schedule.findOne({
      tournamentId: match.tournamentId,
      "teams.teamA": { $in: [newTeamA, newTeamB] },
      "teams.teamB": { $in: [newTeamA, newTeamB] },
      matchDate: { $lt: schedule.matchDate },
    }),
    Match.findOne({
      tournamentId: match.tournamentId,
      teamA: { $in: [newTeamA, newTeamB] },
      teamB: { $in: [newTeamA, newTeamB] },
    }),
  ]);

  if (teamConflict[0] || teamConflict[1]) {
    throw new ApiError(
      400,
      "One or both teams have already played a scheduled match before this match."
    );
  }

  // Check If New Previous Matches Are Already Scheduled
  if (
    newPreviousMatches &&
    newPreviousMatches.matchA &&
    newPreviousMatches.matchB
  ) {
    const prevMatchConflict = await Promise.all([
      Schedule.findOne({
        matchId: {
          $in: [newPreviousMatches.matchA, newPreviousMatches.matchB],
        },
        matchDate: { $lt: schedule.matchDate },
      }),
      Match.findOne({
        _id: { $in: [newPreviousMatches.matchA, newPreviousMatches.matchB] },
      }),
    ]);

    if (prevMatchConflict[0] || prevMatchConflict[1]) {
      throw new ApiError(
        400,
        "One or both previous matches have already been scheduled before this match."
      );
    }
  }

  // Update Match and Schedule in Parallel
  await Promise.all([
    Match.findByIdAndUpdate(
      matchId,
      {
        teamA: newTeamA || match.teamA,
        teamB: newTeamB || match.teamB,
        previousMatches: newPreviousMatches || match.previousMatches,
      },
      { new: true }
    ),
    Schedule.findOneAndUpdate(
      { matchId },
      {
        "teams.teamA": newTeamA || schedule.teams.teamA,
        "teams.teamB": newTeamB || schedule.teams.teamB,
        previousMatches: newPreviousMatches || schedule.previousMatches,
      },
      { new: true }
    ),
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(200, null, "Match and schedule updated successfully")
    );
});
