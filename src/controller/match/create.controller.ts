import { Match } from "../../models/matchModel/match.model";
import { Registration } from "../../models/registrationModel/registrations.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { User } from "../../models/userModel/user.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import mongoose from "mongoose";

export const createMatch = asyncHandler(async (req, res) => {
  const author = (req as any).user;

  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to create a match");
  }

  const { tournamentId } = req.params;
  const {
    teamA,
    teamB,
    matchNumber,
    previousMatches,
    umpire1,
    umpire2,
    umpire3,
  } = req.body;

  if (!tournamentId || !matchNumber) {
    throw new ApiError(400, "Tournament ID and match number are required");
  }

  const hasTeams = !!(teamA && teamB);
  const hasPreviousMatches = !!(
    previousMatches?.matchA && previousMatches?.matchB
  );

  if (!hasTeams && !hasPreviousMatches) {
    throw new ApiError(400, "Provide either teams or previous matches");
  }

  if (hasTeams && hasPreviousMatches) {
    throw new ApiError(400, "Cannot provide both teams and previous matches");
  }

  const session = await mongoose.startSession();

  try {
    let createdMatch: any;

    await session.withTransaction(async () => {
      // fetch tournament (we'll need status later)
      const tournament = await Tournament.findById(tournamentId)
        .select("status")
        .session(session);

      if (!tournament) {
        throw new ApiError(404, "Tournament not found");
      }

      const existingMatch = await Match.exists({
        tournamentId,
        matchNumber,
      }).session(session);

      if (existingMatch) {
        throw new ApiError(
          400,
          "Match number already exists for this tournament"
        );
      }

      // ---------------------------
      // Validate teams
      // ---------------------------
      if (hasTeams) {
        const approvedTeamsCount = await Registration.countDocuments({
          tournamentId,
          teamId: { $in: [teamA, teamB] },
          status: "approved",
        }).session(session);

        if (approvedTeamsCount !== 2) {
          throw new ApiError(400, "Teams must be approved for this tournament");
        }
      }

      // ---------------------------
      // Validate previous matches
      // ---------------------------
      if (hasPreviousMatches) {
        const count = await Match.countDocuments({
          _id: { $in: [previousMatches.matchA, previousMatches.matchB] },
        }).session(session);

        if (count !== 2) {
          throw new ApiError(400, "Invalid previous matches");
        }
      }

      // ---------------------------
      // Validate umpires
      // ---------------------------
      const umpireIds = [umpire1, umpire2, umpire3].filter(Boolean);

      if (umpireIds.length) {
        const validCount = await User.countDocuments({
          _id: { $in: umpireIds },
          role: "umpire",
        }).session(session);

        if (validCount !== umpireIds.length) {
          throw new ApiError(400, "Invalid umpire selection");
        }
      }

      // ---------------------------
      // Create match
      // ---------------------------
      const [match] = await Match.create(
        [
          {
            tournamentId,
            matchNumber,
            teamA: hasTeams ? teamA : null,
            teamB: hasTeams ? teamB : null,
            previousMatches: hasPreviousMatches
              ? previousMatches
              : { matchA: null, matchB: null },
            umpires: {
              firstUmpire: umpire1 || null,
              secondUmpire: umpire2 || null,
              thirdUmpire: umpire3 || null,
            },
            status: "upcoming",
          },
        ],
        { session }
      );

      createdMatch = match.toObject();

      // ---------------------------
      //  Tournament status update
      // ---------------------------

      const isFirstRound = hasTeams;

      if (isFirstRound && tournament.status === "upcoming") {
        await Tournament.updateOne(
          { _id: tournamentId },
          {
            $set: {
              status: "ongoing",
              startedAt: new Date(),
            },
          },
          { session }
        );
      }
    });

    return res
      .status(201)
      .json(new ApiResponse(201, createdMatch, "Match created successfully"));
  } finally {
    session.endSession();
  }
});
