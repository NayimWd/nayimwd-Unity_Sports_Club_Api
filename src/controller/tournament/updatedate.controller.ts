import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const updateDate = asyncHandler(async (req, res) => {
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

  const { registrationDeadline, startDate, endDate } = req.body;

  if (!registrationDeadline && !startDate && endDate) {
    throw new ApiError(400, "Start, End date or RegDate required");
  }

  // date validation
  const regDate = new Date(registrationDeadline.split("-").reverse().join("-"));
  const start = new Date(startDate.split("-").reverse().join("-"));
  const end = new Date(endDate.split("-").reverse().join("-"));

  // getting current date
  const now = new Date();
  const currentDate = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;

  if (startDate < currentDate) {
    throw new ApiError(400, "start Date can not be before present date");
  }

  if (start <= regDate) {
    throw new ApiError(400, "Start date must be after registration deadline");
  }

  if (end <= start) {
    throw new ApiError(400, "End date must be after start date");
  }

  const newDate = await Tournament.findByIdAndUpdate(
    tournamentId,
    {
      registrationDeadline,
      startDate,
      endDate,
    },
    { new: true }
  );

  if (!newDate) {
    throw new ApiError(500, "Tournament Date update failed");
  }

  // return response
  return res
    .status(200)
    .json(
      new ApiResponse(200, newDate, "Tournament Date Updated successfully")
    );
});
