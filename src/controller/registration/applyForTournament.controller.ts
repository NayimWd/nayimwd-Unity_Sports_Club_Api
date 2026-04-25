import { Registration } from "../../models/registrationModel/registrations.model";
import { Team } from "../../models/teamModel/teams.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const applyForTournament = asyncHandler(async (req, res) => {
  // Authentication
  const registrar = (req as any).user;
  if (!registrar || registrar.role !== "manager") {
    throw new ApiError(401, "Unauthorized request, please login");
  }

  // Get tournament ID and team ID
  const { tournamentId } = req.params;
  const { teamId } = req.body;

  if (!tournamentId || !teamId) {
    throw new ApiError(400, "Tournament ID and team ID are required");
  }

  // Check if tournament and team exists
  const [tournament, team] = await Promise.all([
    Tournament.findById(tournamentId).select("teamCount format").lean(),
    Team.findById(teamId).select("managerId playerCount").lean(),
  ]);

  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }
  // Check if tournament is available for registration
  if (tournament.teamCount >= tournament.format) {
    throw new ApiError(400, "Tournament registration is full");
  }

  // Check if the registrar is the manager of the same team
  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  if (registrar._id.toString() !== team.managerId.toString()) {
    throw new ApiError(403, "You are not the manager of this team");
  }

  // check minimum team player
  if (team.playerCount < 14 && team.status !== "active") {
    throw new ApiError(400, "Each Team Should be minimum 14 players");
  }

  // apply or register for tournament
  const registration = await Registration.findOneAndUpdate(
    {
      tournamentId,
      teamId,
    },
    {
      $setOnInsert: {
        tournamentId,
        teamId,
        managerId: registrar._id,
      },
    },
    {
      new: true,
      upsert: true,
    }
  );

  //  check duplicate insert safely
  const isNew = (registration as any).createdAt?.getTime ? true : false;

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        registration,
        isNew ? "Tournament registration successful" : "Team already registered"
      )
    );
});
