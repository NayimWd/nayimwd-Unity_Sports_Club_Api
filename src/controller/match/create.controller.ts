import { Match } from "../../models/matchModel/match.model";
import { Registration } from "../../models/registrationModel/registrations.model";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { User } from "../../models/userModel/user.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

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

  // Validate inputs
  if (!tournamentId || !matchNumber) {
    throw new ApiError(
      400,
      "Please provide tournament ID status, and match number."
    );
  }

  // check if the tournament exists
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }

  // ensure match number is unique per tournament
  const existingMatch = await Match.findOne({ tournamentId, matchNumber });
  if (existingMatch) {
    throw new ApiError(400, "Match number already exists for this tournament");
  }

  // validate team teamA and teamB or previousMatches.matchA and matchB
  if (
    (!teamA || !teamB) &&
    (!previousMatches || !previousMatches?.matchA || !previousMatches?.matchB)
  ) {
    throw new ApiError(
      400,
      "Please provide either teamA and teamB or previousMatches.matchA and matchB"
    );
  }

  // Determine round type and validate accordingly
  const isFirstRound = !!(teamA && teamB);
  const isQualifierRound = !!(
    previousMatches?.matchA && previousMatches?.matchB
  );

  if (!(isFirstRound || isQualifierRound)) {
    throw new ApiError(
      400,
      "For Round 1, provide teamA and teamB. For qualifiers, provide previous match references."
    );
  }

  // ✅ **Validate Teams in Round 1**
  if (isFirstRound) {
    const registeredTeams = await Registration.find({
      tournamentId,
      teamId: { $in: [teamA, teamB] },
      status: "approved", // Only approved teams
    });

    if (registeredTeams.length !== 2) {
      throw new ApiError(
        400,
        "One or both teams are not registered or approved for this tournament."
      );
    }
  }

  // **Validate Previous Matches for Qualifier Rounds**
  if (isQualifierRound) {
    const matchA = await Match.findById(previousMatches.matchA);
    const matchB = await Match.findById(previousMatches.matchB);

    if (!matchA || !matchB) {
      throw new ApiError(400, "One or both previous matches not found.");
    }
  }

   // ✅ **Validate Umpires**
   const umpireIds = [umpire1, umpire2, umpire3].filter(Boolean); // Remove null values
   if (umpireIds.length > 0) {
     const umpires = await User.find({ _id: { $in: umpireIds }, role: "umpire" });
 
     if (umpires.length !== umpireIds.length) {
       throw new ApiError(400, "One or more assigned umpires are not valid umpires.");
     }
   }

  // create match
  const match = new Match({
    tournamentId,
    matchNumber,
    teamA: teamA ? teamA : null,
    teamB: teamB ? teamB : null,
    previousMatches,
    winner: null,
    umpires: {
      firstUmpire: umpire1,
      secondUmpire: umpire2,
      thirdUmpire: umpire3,
    },
    status: "upcoming"
  });
  // save match
  await match.save();

  // send response
  return res
    .status(201)
    .json(new ApiResponse(201, match, "Match created successfully"));
});
