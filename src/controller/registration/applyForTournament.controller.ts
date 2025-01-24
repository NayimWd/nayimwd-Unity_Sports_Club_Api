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
  };

  // Get tournament ID and team ID
  const { tournamentId } = req.params;
  const { teamId } = req.body;

  if (!tournamentId || !teamId) {
    throw new ApiError(400, "Tournament ID and team ID are required");
  }

  // Check if tournament exists
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }

  // Check if tournament is open for registration
  if (tournament.seats >= tournament.format) {
    throw new ApiError(400, "Tournament registration is full");
  }

  // Check if the registrar is the manager of the team
  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  if (registrar._id.toString() !== team.managerId.toString()) {
    throw new ApiError(403, "You are not the manager of this team");
  }

  // Check for existing registration
  const existingRegistration = await Registration.findOne({
    tournamentId,
    teamId,
  });
  if (existingRegistration) {
    throw new ApiError(
      400,
      "This team is already registered for the tournament"
    );
  }

  // Apply or register for tournament
  const registration = await Registration.create({
    tournamentId,
    teamId,
    managerId: registrar._id,
  });

  

  // Return response
  return res
    .status(201)
    .json(
      new ApiResponse(201, registration, "Tournament registration successful")
    );
});
