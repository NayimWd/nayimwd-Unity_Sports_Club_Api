import { Match } from "../../models/matchModel/match.model";
import { PlayingSquad } from "../../models/matchModel/playingSquad.model";
import { PlayerProfile } from "../../models/profilesModel/playerProfile.model";
import { TeamPlayer } from "../../models/teamModel/teamPlayer.model";
import { Team } from "../../models/teamModel/teams.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";

export const addPlayingSquad = asyncHandler(
  async (req: Request, res: Response) => {
    // Authentication and authorization from token
    const manager = (req as any).user;
    if (!manager?._id || manager.role !== "manager") {
      throw new ApiError(
        403,
        "Unauthorized request. Please log in as a manager."
      );
    }

    // Get data from request params and body
    const { tournamentId, matchId } = req.params;
    const { teamId, addPlayers = [], removePlayers = [] } = req.body;

    // Validate request parameters
    if (!tournamentId || !matchId || !teamId) {
      throw new ApiError(
        400,
        "Invalid request. Provide tournamentId, matchId, and teamId."
      );
    }
    if (!Array.isArray(addPlayers) || !Array.isArray(removePlayers)) {
      throw new ApiError(
        400,
        "'addPlayers' and 'removePlayers' must be arrays."
      );
    }

    // Fetch match and team
    const [match, team] = await Promise.all([
      Match.findOne({
        _id: matchId,
        tournamentId,
        $or: [{ teamA: teamId }, { teamB: teamId }],
      }),
      Team.findById(teamId),
    ]);

    if (!match) {
      throw new ApiError(
        404,
        "Match not found or team is not part of this match."
      );
    }
    if (!team) {
      throw new ApiError(404, "Team not found.");
    }
    if (team.managerId.toString() !== manager._id.toString()) {
      throw new ApiError(403, "You are not the manager of this team.");
    }

    // Ensure match has not started
    if (match.status !== "scheduled") {
      throw new ApiError(
        400,
        "Playing squad cannot be updated after the match has started."
      );
    }

    // Fetch existing squad
    const playingSquad = await PlayingSquad.findOne({
      tournamentId,
      matchId,
      teamId,
    });
    if (!playingSquad) {
      throw new ApiError(404, "Playing squad not found.");
    }

    let updatedPlayers = playingSquad.players.map((p) => p.toString());

    // Remove players
    updatedPlayers = updatedPlayers.filter(
      (playerId) => !removePlayers.includes(playerId)
    );

    // Add new players (ensure uniqueness)
    updatedPlayers = [...new Set([...updatedPlayers, ...addPlayers])];

    // Ensure squad size remains exactly 11
    if (updatedPlayers.length !== 11) {
      throw new ApiError(
        400,
        `Playing squad must contain exactly 11 players. Current count: ${updatedPlayers.length}.`
      );
    }

    // Check if all players exist in the team
    const teamPlayers = await TeamPlayer.find({
      playerId: { $in: updatedPlayers },
      teamId,
    });
    if (teamPlayers.length !== 11) {
      throw new ApiError(400, "One or more players are not part of the team.");
    }

    // Validate squad composition
    let batsmen = 0,
      wkBatsman = 0,
      allRounder = 0,
      bowlers = 0,
      captainCount = 0;

    let newCaptain;

    for (const teamPlayer of teamPlayers) {
      const playerRole = await PlayerProfile.findOne({
        userId: teamPlayer.playerId.toString(),
      }).select("player_role");

      if (teamPlayer.isCaptain) {
        newCaptain = teamPlayer.playerId.toString();
        captainCount++;
      }

      if (!playerRole) continue;

      switch (playerRole.player_role) {
        case "batsman":
          batsmen++;
          break;
        case "wk-batsman":
          wkBatsman++;
          break;
        case "all-rounder":
          allRounder++;
          break;
        case "bowler":
          bowlers++;
          break;
      }
    }

    // Role validations
    if (batsmen < 4)
      throw new ApiError(400, "Squad must contain at least 4 batsmen.");
    if (wkBatsman < 1)
      throw new ApiError(
        400,
        "Squad must contain at least 1 wicketkeeper-batsman."
      );
    if (allRounder < 1)
      throw new ApiError(400, "Squad must contain at least 1 all-rounder.");
    if (bowlers < 3)
      throw new ApiError(400, "Squad must contain at least 3 bowlers.");
    if (captainCount !== 1)
      throw new ApiError(400, "Squad must contain exactly 1 captain.");

    // Update squad
    (playingSquad as any).players = updatedPlayers;
    (playingSquad.captain as any) = newCaptain;
    await playingSquad.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          playingSquad,
          "Playing squad updated successfully."
        )
      );
  }
);
