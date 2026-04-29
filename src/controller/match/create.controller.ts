import { Match } from "../../models/matchModel/match.model";
import { Registration } from "../../models/registrationModel/registrations.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { User } from "../../models/userModel/user.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import mongoose from "mongoose";

export const createMatch = asyncHandler(async (req, res) => {
  // Authentication
  const author = (req as any).user;
  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to create a match");
  }

  // Extract parameters
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
    throw new ApiError(
      400,
      "Please provide tournament ID status, and match number."
    );
  }
  // check team or prev match provided
  const hasTeams = !!(teamA && teamB);
  const hasPreviousMatches = !!(
    previousMatches?.matchA && previousMatches?.matchB
  );
  // validate require for only one option
  if (!hasTeams && !hasPreviousMatches) {
    throw new ApiError(
      400,
      "Please provide either teamA and teamB or previousMatches.matchA and matchB"
    );
  }
  // validate 2 option can not provide at once
  if (hasTeams && hasPreviousMatches) {
    throw new ApiError(
      400,
      "Provide either direct teams or previous matches, not both."
    );
  }

  const session = await mongoose.startSession();

  try {
    let createdMatch: any;

    await session.withTransaction(async () => {
      // check existance of tournament and match
      const [tournamentExists, existingMatch] = await Promise.all([
        Tournament.exists({ _id: tournamentId }).session(session),
        Match.exists({ tournamentId, matchNumber }).session(session),
      ]);

      if (!tournamentExists) {
        throw new ApiError(404, "Tournament not found");
      }

      if (existingMatch) {
        throw new ApiError(
          400,
          "Match number already exists for this tournament"
        );
      }
      // check team is approved for the tournament
      if (hasTeams) {
        const approvedTeamsCount = await Registration.countDocuments({
          tournamentId,
          teamId: { $in: [teamA, teamB] },
          status: "approved",
        }).session(session);

        if (approvedTeamsCount !== 2) {
          throw new ApiError(
            400,
            "One or both teams are not registered or approved for this tournament."
          );
        }
      }
      // check team has prev patches
      if (hasPreviousMatches) {
        const [matchAExists, matchBExists] = await Promise.all([
          Match.exists({ _id: previousMatches.matchA }).session(session),
          Match.exists({ _id: previousMatches.matchB }).session(session),
        ]);

        if (!matchAExists || !matchBExists) {
          throw new ApiError(400, "One or both previous matches not found.");
        }
      }
      // validate umpire
      const umpireIds = [umpire1, umpire2, umpire3].filter(Boolean);

      if (umpireIds.length) {
        const validUmpiresCount = await User.countDocuments({
          _id: { $in: umpireIds },
          role: "umpire",
        }).session(session);

        if (validUmpiresCount !== umpireIds.length) {
          throw new ApiError(
            400,
            "One or more assigned umpires are not valid umpires."
          );
        }
      }
      // create match
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
    });

    return res
      .status(201)
      .json(new ApiResponse(201, createdMatch, "Match created successfully"));
  } finally {
    await session.endSession();
  }
});
