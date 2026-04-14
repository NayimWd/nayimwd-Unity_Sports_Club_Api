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
  const tournament = await Tournament.exists({ _id: tournamentId });

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

// get search & select controller
export const getApprovedTeamsForSelect = asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;

  const exists = await Tournament.exists({ _id: tournamentId });

  if (!exists) {
    throw new ApiError(400, "No team found");
  }

  const teams = await Registration.find({
    tournamentId,
    status: "approved",
  })
    .select("teamId")
    .populate({
      path: "teamId",
      model: "Team",
      select: "_id teamName",
    })
    .lean();

  const formatted = teams.map((t: any) => ({
    _id: t.teamId._id,
    teamName: t.teamId?.teamName ? t.teamId?.teamName : "Name Not found",
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, formatted, 
      formatted.length ? "Team found successfully" : "No team approved yet"
    ));
});
