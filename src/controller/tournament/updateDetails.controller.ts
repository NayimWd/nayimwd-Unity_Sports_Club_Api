import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const updateTournamentDetails = asyncHandler(async (req, res) => {
  // authorize with token
  const creator = (req as any).user;
  // validate
  if (!creator) {
    throw new ApiError(401, "Unauthorize request, Please Login");
  }

  // check if admin or staff
  if (!["admin", "staff"].includes(creator.role)) {
    throw new ApiError(403, "Unauthorized request to update tournament photo");
  }

  // get tournamentID from req params
  const { tournamentId } = req.params;

  if (!tournamentId) {
    throw new ApiError(400, "Tournament Id is required");
  }

  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new ApiError(404, "Tournament is required");
  }

  // get data from req body
  const {
    tournamentName,
    tournamentType,
    description,
    format,
    ballType,
    matchOver,
    status,
    entryFee,
    champion,
    runnerUp,
    thirdPlace,
  } = req.body;

  // update details
  const updateDetails = await Tournament.findByIdAndUpdate(
    tournamentId,
    {
      tournamentName,
      tournamentType,
      description,
      format,
      ballType,
      matchOver,
      seat: format,
      teamCount: 0,
      status,
      entryFee,
      champion,
      runnerUp,
      thirdPlace,
    },
    { new: true }
  );

  // validate
  if (!updateDetails) {
    throw new ApiError(500, "Tournament Details update failed");
  }

  // return resopnse
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updateDetails,
        "Tournament details updated successfully"
      )
    );
});
