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

  // get data from req body
  const {
    tournamentName,
    tournamentType,
    description,
    format,
    ballType,
    matchOver,
    registrationDeadline,
    startDate,
    endDate,
    status,
    entryFee,
    champion,
    runnerUp,
    thirdPlace,
  } = req.body;

  // date validation
  const regDate = new Date(registrationDeadline.split("-").reverse().join("-"));
  const start = new Date(startDate.split("-").reverse().join("-"));
  const end = new Date(endDate.split("-").reverse().join("-"));

  if (
    isNaN(regDate.getTime()) ||
    isNaN(start.getTime()) ||
    isNaN(end.getTime())
  ) {
    throw new ApiError(400, "Invalid date format");
  }

  if (start <= regDate) {
    throw new ApiError(400, "Start date must be after registration deadline");
  }

  if (end <= start) {
    throw new ApiError(400, "End date must be after start date");
  }

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
      registrationDeadline,
      startDate,
      endDate,
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
