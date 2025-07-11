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

  // Get status filter (optional)
  const { status } = req.query;

  // Build query dynamically
  const query: any = { tournamentId };
  if (status) {
    query.status = status; // Only add status filter if provided
  }

  // find registration
  const registration = await Registration.find(query)
    .select("status")
    .populate({
      path: "managerId",
      select: "name",
    })
    .populate({
      path: "teamId",
      select: "teamName",
    })
    .lean();

  // total registration
  const total = registration.length;

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

export const getPendingRegistration = asyncHandler(async (req, res) => {
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
  const registration = await Registration.find({
    tournamentId,
    status: "pending",
  })
    .select("status")
    .populate({
      path: "managerId",
      select: "name",
    })
    .populate({
      path: "teamId",
      select: "teamName",
    })
    .lean();

  // total registration
  const total = registration.length;

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
