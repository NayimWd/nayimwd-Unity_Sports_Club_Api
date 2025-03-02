import mongoose from "mongoose";
import { Match } from "../../models/matchModel/match.model";
import { TeamPlayer } from "../../models/teamModel/teamPlayer.model";
import { Team } from "../../models/teamModel/teams.model";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { PlayerProfile } from "../../models/profilesModel/playerProfile.model";
import { PlayingSquad } from "../../models/matchModel/playingSquad.model";
import { ApiResponse } from "../../utils/ApiResponse";

export const updatePlayingSquad = asyncHandler(async (req, res) => {
  // Authentication and authorization
  const manager = (req as any).user;
  if (!manager._id || manager.role !== "manager") {
    throw new ApiError(
      400,
      "Unauthorized request, Please log in as a manager."
    );
  }

  // Extract data from request
  const { tournamentId, matchId, teamId } = req.params;
  const { addPlayers, removePlayers, newCaptainId } = req.body; // Include newCaptainId for captain selection

  if (!tournamentId || !matchId || !teamId) {
    throw new ApiError(
      400,
      "Invalid request. Provide tournamentId, matchId, and teamId."
    );
  }

  if (
    (!addPlayers || !Array.isArray(addPlayers)) &&
    (!removePlayers || !Array.isArray(removePlayers))
  ) {
    throw new ApiError(
      400,
      "Invalid request. Provide addPlayers or removePlayers as an array."
    );
  }

  // Validate match and team
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

  // Ensure manager owns this team
  if (team?.managerId.toString() !== manager._id.toString()) {
    throw new ApiError(403, "You are not the manager of this team.");
  }

  // Ensure match has not started
  if (match.status !== "scheduled") {
    throw new ApiError(400, "Cannot update squad now.");
  }

  // Fetch existing playing squad
  const isExistingSquad = await PlayingSquad.findOne({
    tournamentId,
    matchId,
    teamId,
  });

  if (!isExistingSquad) {
    throw new ApiError(404, "Playing squad not found.");
  }

  let updatedPlayers = isExistingSquad.players.map((p) => p.toString()); // Convert ObjectId to string

  // Remove players
  if (removePlayers && removePlayers.length) {
    updatedPlayers = updatedPlayers.filter(
      (playerId) => !removePlayers.includes(playerId)
    );
  }

  // Add new players
  if (addPlayers && addPlayers.length) {
    updatedPlayers.push(...addPlayers);
  }

  // Remove duplicates
  updatedPlayers = [...new Set(updatedPlayers)];

  // Ensure squad has exactly 11 players
  if (updatedPlayers.length !== 11) {
    throw new ApiError(
      400,
      `Squad must contain exactly 11 players after update. Current count: ${updatedPlayers.length}`
    );
  }

  // Fetch team players in one query (Optimized)
  const teamPlayers = await TeamPlayer.find({
    playerId: { $in: updatedPlayers },
    teamId,
  }).populate("playerId", "player_role");

  if (teamPlayers.length !== 11) {
    throw new ApiError(400, "One or more players are not part of the team.");
  }

  // Role Validation
  let batsmen = 0,
    wkBatsman = 0,
    allRounder = 0,
    bowlers = 0;

  for (const teamPlayer of teamPlayers) {
    const playerProfile = await PlayerProfile.findById(teamPlayer.playerId);

    switch (playerProfile?.player_role) {
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

  // Validate squad composition
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

  // Validate Captain
  let captainId = isExistingSquad.captain?.toString();

  // If previous captain is removed, require a new captain selection
  if (!updatedPlayers.includes(captainId) || newCaptainId) {
    if (!newCaptainId || !updatedPlayers.includes(newCaptainId)) {
      throw new ApiError(400, "A new valid captain must be selected.");
    }
    captainId = newCaptainId;
  }

  // Update playing squad
  isExistingSquad.players = updatedPlayers.map(
    (playerId) => new mongoose.Types.ObjectId(playerId)
  );
  isExistingSquad.captain = new mongoose.Types.ObjectId(captainId);

  await isExistingSquad.save();

  // Return response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        isExistingSquad,
        "Playing squad updated successfully"
      )
    );
});
