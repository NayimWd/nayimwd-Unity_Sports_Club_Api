import { Registration } from "../../models/registrationModel/registrations.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const myApplication = asyncHandler(async (req, res) => {
  // Authentication
  const teamManager = (req as any).user;

  if (!teamManager._id || teamManager.role !== "manager") {
    throw new ApiError(401, "Unauthorized request, please login");
  }

  const { tournamentId } = req.params;

  if (!tournamentId) {
    throw new ApiError(400, "TournamentId required");
  }

  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new ApiError(404, "Tournament not exists");
  }

  // find my application
  const application = await Registration.findOne({
    tournamentId: tournamentId,
    managerId: teamManager._id.toString(),
  }).lean();

  // response
  return res
    .status(200)
    .json(
      new ApiResponse(
       200,
       application,
       application ? "Application fetched successfully" : "You have not any application!"
    )
    );
});
