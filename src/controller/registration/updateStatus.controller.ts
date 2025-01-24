import { Registration } from "../../models/registrationModel/registrations.model";
import { Team } from "../../models/teamModel/teams.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const updateStatus = asyncHandler(async (req, res) => {
  // Authentication
  const author = (req as any).user;
  if (!["admin", "staff"].includes(author.role)) {
    throw new ApiError(401, "Unauthorized request");
  }

  // Get tournament and team ID
  const { tournamentId } = req.params;
  const { teamId, status } = req.body;

  if (!tournamentId || !teamId) {
    throw new ApiError(400, "Tournament and Team ID are required");
  }
  if (!status) {
    throw new ApiError(400, "Status is missing");
  }

  // Check if tournament and team exist
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }

  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(404, "Team not found");
  }

  // Check if registration exists
  const existingRegistration = await Registration.findOne({
    tournamentId,
    teamId,
  });

  if (!existingRegistration) {
    throw new ApiError(404, "This team has not yet applied to this tournament");
  }

  // Update status
  const updatedRegistration = await Registration.findOneAndUpdate(
    { tournamentId, teamId },
    { status },
    { new: true }
  );

  if (!updatedRegistration) {
    throw new ApiError(500, "Registration status update failed");
  }

  // Increment or decrement seats count in the tournament based on status
  if (updatedRegistration.status === "approved") {
    if (tournament.teamCount >= tournament.format) {
      throw new ApiError(400, "No seats available");
    }
    tournament.teamCount += 1; // Increment seat count for approved status
    await tournament.save();
  } else if (
    existingRegistration.status === "approved" &&
    ["rejected"].includes(status)
  ) {
    // Decrement seat count if status changes from approved to rejected/withdrawn
    tournament.teamCount -= 1;
    await tournament.save();
  }

  // Return response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { status: updatedRegistration.status },
        "Registration status updated successfully"
      )
    );
});
