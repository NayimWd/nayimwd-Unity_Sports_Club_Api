import { Registration } from "../../models/registrationModel/registrations.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const getTeamsOfTournament = asyncHandler(async (req, res) => {
  // get tournament Id from req body
  const { tournamentId } = req.params;

  // validate
  if (!tournamentId) {
    throw new ApiError(400, "Tournament Id required");
  }

  // check if tournament exists
  const tournament = await Tournament.findById(tournamentId);

  if (!tournament) {
    throw new ApiError(400, "Tournament Not found");
  }

  // find teams of a tournament from approved register
  const teams = await Registration.find({ tournamentId, status: "approved" })
    .select("tournamentId teamId applicationDate")
    .populate({
      path: "teamId",
      model: "Team",
      select: "teamName teamLogo _id",
    });

  // return response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total: teams.length,
        teams: teams || null,
      },
      teams
        ? "Tournament team found successfully"
        : "No Team Exists in this Tournament"
    )
  );
});
