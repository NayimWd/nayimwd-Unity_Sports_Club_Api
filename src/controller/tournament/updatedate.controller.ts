import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const updateDate = asyncHandler(async (req, res) => {
  const creator = (req as any).user;

  if (!creator) throw new ApiError(401, "Unauthorize request, Please Login");

  if (!["admin", "staff"].includes(creator.role)) {
    throw new ApiError(403, "Unauthorized request to update tournament date");
  }

  const { tournamentId } = req.params;
  if (!tournamentId) throw new ApiError(400, "Tournament Id is required");

  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) throw new ApiError(404, "Tournament not found");

  const { registrationDeadline, startDate, endDate } = req.body;

  // require at least one param
  if (!registrationDeadline && !startDate && !endDate) {
    throw new ApiError(
      400,
      "At least one of Start, End or Registration date is required"
    );
  }

  // string to date converter
  const parseDMY = (value: string) => {
    if (!value) return undefined;
    const [d, m, y] = value.split("-");
    return new Date(`${y}-${m}-${d}`);
  };

  const regDate = parseDMY(registrationDeadline);
  const start = parseDMY(startDate);
  const end = parseDMY(endDate);
  const now = new Date();

  // validate dates
  if (start && start < now) {
    throw new ApiError(400, "Start date cannot be before present date");
  }

  if (start && regDate && start <= regDate) {
    throw new ApiError(400, "Start date must be after registration deadline");
  }

  if (end && start && end <= start) {
    throw new ApiError(400, "End date must be after start date");
  }

  // update provide date
  const payload: any = {};
  if (registrationDeadline) payload.registrationDeadline = registrationDeadline;
  if (startDate) payload.startDate = startDate;
  if (endDate) payload.endDate = endDate;

  const updated = await Tournament.findByIdAndUpdate(tournamentId, payload, {
    new: true,
  });

  if (!updated) throw new ApiError(500, "Tournament Date update failed");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updated, "Tournament Date Updated successfully")
    );
});
