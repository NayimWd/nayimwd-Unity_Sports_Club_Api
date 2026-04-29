import { Match } from "../../models/matchModel/match.model";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { Team } from "../../models/teamModel/teams.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import mongoose from "mongoose";

export const changeTeams = asyncHandler(async (req, res) => {
  // validate user
  const author = (req as any).user;

  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to change the schedule.");
  }
  // get ids of schedule, new team A+B, matchId from params and body
  const { scheduleId } = req.params;
  const { newTeamA, newTeamB, newMatchId } = req.body;
  // validate given data
  if (!scheduleId) {
    throw new ApiError(400, "Please provide a valid schedule ID.");
  }

  if (!newTeamA && !newTeamB && !newMatchId) {
    throw new ApiError(
      400,
      "Provide at least one team or a new match reference to update."
    );
  }
  // start session
  const session = await mongoose.startSession();

  try {
    let updatedSchedule: any;

    await session.withTransaction(async () => {
      // find schedule and select only require fields + validate
      const schedule = await Schedule.findById(scheduleId)
        .select("matchId matchDate teams")
        .lean()
        .session(session);

      if (!schedule) {
        throw new ApiError(404, "Schedule not found.");
      }

      //  match check
      const matchStatus = await Match.findById(schedule.matchId)
        .select("status teamA teamB")
        .lean()
        .session(session);

      if (!matchStatus) {
        throw new ApiError(404, "Match not found.");
      }

      if (["in-progress", "completed"].includes(matchStatus.status)) {
        throw new ApiError(
          400,
          "Cannot change teams for a match that is live or completed."
        );
      }
      // check and prevent same team id for same field (prev + new)
      const teamA = newTeamA || schedule.teams.teamA;
      const teamB = newTeamB || schedule.teams.teamB;

      if (teamA?.toString() === teamB?.toString()) {
        throw new ApiError(400, "Team A and Team B cannot be the same.");
      }

      const teamIds = [teamA, teamB];

      // parallel team + schedule conflict check
      const [teamCount, conflictSchedule] = await Promise.all([
        Team.countDocuments({ _id: { $in: teamIds } }).session(session),
        Schedule.exists({
          _id: { $ne: scheduleId },
          matchDate: schedule.matchDate,
          $or: [
            { "teams.teamA": { $in: teamIds } },
            { "teams.teamB": { $in: teamIds } },
          ],
        }).session(session),
      ]);

      if (teamCount !== teamIds.length) {
        throw new ApiError(404, "One or both teams do not exist.");
      }
      // return if conflict found
      if (conflictSchedule) {
        throw new ApiError(
          400,
          "One or both new teams are already scheduled on this date."
        );
      }

      let finalMatchId = schedule.matchId;

      if (newMatchId) {
        const [matchExists, alreadyAssigned] = await Promise.all([
          Match.exists({ _id: newMatchId }).session(session),
          Schedule.exists({
            _id: { $ne: scheduleId },
            matchId: newMatchId,
          }).session(session),
        ]);

        if (!matchExists) {
          throw new ApiError(404, "Provided match ID does not exist.");
        }

        if (alreadyAssigned) {
          throw new ApiError(
            400,
            "The new match is already assigned to another schedule."
          );
        }

        finalMatchId = newMatchId;
      }

      //  updates
      await Promise.all([
        Schedule.updateOne(
          { _id: scheduleId },
          {
            $set: {
              matchId: finalMatchId,
              "teams.teamA": teamA,
              "teams.teamB": teamB,
            },
          },
          { session }
        ),

        Match.updateOne(
          { _id: finalMatchId },
          {
            $set: {
              teamA,
              teamB,
            },
          },
          { session }
        ),
      ]);

      updatedSchedule = await Schedule.findById(scheduleId)
        .lean()
        .session(session);
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedSchedule,
          "Schedule and Match updated successfully."
        )
      );
  } finally {
    await session.endSession();
  }
});
