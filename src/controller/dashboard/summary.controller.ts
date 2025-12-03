import { PlayerProfile } from "../../models/profilesModel/playerProfile.model";
import { Team } from "../../models/teamModel/teams.model";
import { TournamentResult } from "../../models/tournamentModel/tournamentResult.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { User } from "../../models/userModel/user.model";
import { Venue } from "../../models/venueModel/venue.model";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const GetSummary = asyncHandler(async (req, res) => {
  const result = {
    tournamentCount: null,
    teamCount: null,
    playerCount: null,
    umpireCount: null,
    venueCount: null,
    runningPlayerCount: null,
  };

  try {
    const [
      tournaments,
      teams,
      players,
      umpires,
      venues,
      runningPlayers,
    ] = await Promise.allSettled([
      Tournament.countDocuments(),
      Team.countDocuments(),
      User.countDocuments({ role: "player" }),
      User.countDocuments({ role: "umpire" }),
      Venue.countDocuments(),
      PlayerProfile.countDocuments(),
    ]);

    // Assign only if fulfilled
    if (tournaments.status === "fulfilled") result.tournamentCount = tournaments.value;
    if (teams.status === "fulfilled") result.teamCount = teams.value;
    if (players.status === "fulfilled") result.playerCount = players.value;
    if (umpires.status === "fulfilled") result.umpireCount = umpires.value;
    if (venues.status === "fulfilled") result.venueCount = venues.value;
    if (runningPlayers.status === "fulfilled") result.runningPlayerCount = runningPlayers.value;

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Summary generated"));
  } catch (error) {
    // Fallback 
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to generate summary"));
  }
});

