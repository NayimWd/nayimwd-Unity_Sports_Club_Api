import { Match } from "../../models/matchModel/match.model";
import { MatchResult } from "../../models/matchModel/matchResult.model";
import { Registration } from "../../models/registrationModel/registrations.model";
import { TeamPlayer } from "../../models/teamModel/teamPlayer.model";
import { Team } from "../../models/teamModel/teams.model";
import { TournamentResult } from "../../models/tournamentModel/tournamentResult.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const teamSummary = asyncHandler(async (req, res) => {
  const manager = (req as any).user;

  if (!manager || manager.role !== "manager") {
    throw new ApiError(
      401,
      "Unauthorized request, please login as a team manager"
    );
  }
  // get basic team info
  const team = await Team.findOne({ managerId: manager._id })
    .select("-status -managerId")
    .lean();

  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  const teamId = team._id;

  // run all queries in parallel
  const [
    totalMatches,
    totalWins,
    totalLosses,
    totalTournaments,
    totalTournamentWins,
    totalRunnerUp,
    totalThirdPlace,
  ] = await Promise.all([
    // total matches played (teamA OR teamB)
    Match.countDocuments({
      status: "completed",
      $or: [{ teamA: teamId }, { teamB: teamId }],
    }),

    // total wins
    MatchResult.countDocuments({ winner: teamId }),

    // total losses
    MatchResult.countDocuments({ defeated: teamId }),

    // tournaments played
    Registration.countDocuments({ teamId }),

    // tournament stats
    TournamentResult.countDocuments({ "result.champion": teamId }),
    TournamentResult.countDocuments({ "result.runnerUp": teamId }),
    TournamentResult.countDocuments({ "result.thirdPlace": teamId }),
  ]);

  //  build response
  const summary = {
    teamInfo: {
      name: team.teamName,
      logo: team.teamLogo,
      totalPlayers: team.playerCount || 0,
    },
    stats: {
      totalMatches,
      wins: totalWins,
      losses: totalLosses,
      totalTournaments,
    },

    tournamentStats: {
    championships: totalTournamentWins,
    runnerUps: totalRunnerUp,
    thirdPlace: totalThirdPlace,
  },
  };

  return res
    .status(200)
    .json(new ApiResponse(200, summary, "Team summary generated successfully"));
});
