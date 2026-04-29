import mongoose from "mongoose";
import { Registration } from "../../models/registrationModel/registrations.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const updateStatus = asyncHandler(async (req, res) => {
  const author = (req as any).user;

  if (!["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "Unauthorized request");
  }

  const { tournamentId } = req.params;
  const { teamId, status } = req.body;

  if (!tournamentId || !teamId) {
    throw new ApiError(400, "Tournament and Team ID are required");
  }

  if (!["approved", "rejected", "pending"].includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // fetch required data inside transaction
      const [tournament, registration] = await Promise.all([
        Tournament.findById(tournamentId)
          .select("format teamCount")
          .session(session),

        Registration.findOne({ tournamentId, teamId }).session(session),
      ]);

      if (!tournament) {
        throw new ApiError(404, "Tournament not found");
      }

      if (!registration) {
        throw new ApiError(404, "This team has not applied to this tournament");
      }

      const prevStatus = registration.status;

      // stop duplicate action
      if (prevStatus === status) {
        return new ApiError(400, "Already approved")
      }

      // manage seats of tournament
      if (status === "approved") {
        // Only check when moving TO approved
        if (tournament.teamCount >= tournament.format) {
          throw new ApiError(400, "No seats available");
        }

        tournament.teamCount += 1;
      }

      // seat count decrease if prev status is not approved
      if (prevStatus === "approved" && status !== "approved") {
        tournament.teamCount -= 1;
      }

      // update registration
      registration.status = status;

      // save both reg and tournament
      await Promise.all([
        registration.save({ session }),
        tournament.save({ session }),
      ]);
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { status },
          "Registration status updated successfully"
        )
      );
  } catch (error) {
    throw error;
  } finally {
    session.endSession();
  }
});
