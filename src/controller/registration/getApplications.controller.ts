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
  let { status } = req.query;

  const validStatus = ["pending", "approved", "rejected", "withdrawn"];

  const query: any = {
    tournamentId: tournamentId,
  };

  if (status && validStatus.includes(String(status))) {
    query.status = status;
  }

  // find registration
  const registration = await Registration.find(query)
    .select("status")
    .populate({
      path: "managerId",
      model: "User",
      select: "name",
    })
    .populate({
      path: "teamId",
      model: "Team",
      select: "teamName teamLogo",
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
      model: "User",
      select: "name",
    })
    .populate({
      path: "teamId",
      model: "Team",
      select: "teamName teamLogo",
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
