import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const updateTournamentStatus = asyncHandler(async (req, res) => {
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

  // get status from req body
  const { status } = req.body;

  if(!status){
    throw new ApiError(400, "Please select one to update status")
  }

  const updateStatus = await Tournament.findByIdAndUpdate(
    tournamentId,
    { status: status },
    { new: true }
  );

  if (!updateStatus) {
    throw new ApiError(500, "Update tournament status failed");
  }

  // return response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updateStatus.status,
        "Tournament status successfully updated"
      )
    );
});
