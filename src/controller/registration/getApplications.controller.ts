import { Registration } from "../../models/registrationModel/registrations.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const getTournamentApplication = asyncHandler(async (req, res) => {
  // auth check
  const author = (req as any).user;
  if (!["admin", "staff"].includes(author.role)) {
    throw new ApiError(401, "Unauthorized request");
  }
  // get rournament ID
  const { tournamentId } = req.params;
  if (!tournamentId) {
    throw new ApiError(400, "Tournament ID is required");
  }

  // find registration
  const registration = await Registration.findOne({ tournamentId }).populate({
    path: "managerId",
    select: "name"
  })
  .populate({
    path: "teamId",
    select: "teamName"
  })

  if (!registration) {
    throw new ApiError(404, "No registration found for this tournament");
  }
  // total registration
  const total = await Registration.countDocuments({ tournamentId });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        total: total,
        registration,
      },
      "Registration fetched successfully"
    )
  );
});
