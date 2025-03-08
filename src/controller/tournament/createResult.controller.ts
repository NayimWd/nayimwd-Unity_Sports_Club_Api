import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { TournamentResult } from "../../models/tournamentModel/tournamentResult.model";
import { PointTable } from "../../models/point table/pointTables.model";
import { User } from "../../models/userModel/user.model";
import { PlayerProfile } from "../../models/profilesModel/playerProfile.model";
import { ApiResponse } from "../../utils/ApiResponse";

export const createTournamentResult = asyncHandler(async (req, res) => {
  // authenticate user
  const author = (req as any).user;
  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to create a match");
  }

  // get tournament Id
  const { tournamentId } = req.params;
  const { manOfTheTournament, awardFor } = req.body;
  if (!tournamentId || !manOfTheTournament || !awardFor) {
    throw new ApiError(
      400,
      "Tournament ID, Man of the Tournament, and awardFor are required."
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // check if tournament exists
    const tournament = await Tournament.findById(tournamentId).session(session);
    if (!tournament) {
      throw new ApiError(404, "Tournament not found");
    }
    if (tournament.status !== "completed") {
      throw new ApiError(400, "Tournament is not completed yet");
    }

    // ensure that the tournament result is not already created
    const existingResult = await TournamentResult.findOne({
      tournamentId,
    }).session(session);
    if (existingResult) {
      throw new ApiError(400, "Tournament result already exists");
    }

    // get champion, runnerUp, and thirdPlace from the tournament points table
    const pointsTable = await PointTable.find({ tournamentId })
      .sort({ points: -1, wins: -1, matchPlayed: -1 })
      .limit(3)
      .select("teamId")
      .lean()
      .session(session);

    // check team length in the points table
    if (pointsTable.length < 2) {
      throw new ApiError(400, "There are not enough teams to create a result");
    }

    // pick the first three teams from the points table
    const champion = pointsTable[0].teamId;
    const runnerUp = pointsTable[1].teamId;
    const thirdPlace = pointsTable[2]?.teamId || null;

    // check man of the tournament is belongs to the tournament teams
    const validateTeam = pointsTable.map((team) => team.teamId.toString());
    const player = await PlayerProfile.findOne({
      userId: manOfTheTournament,
      teamId: { $in: validateTeam },
    })
      .select("_id")
      .lean()
      .session(session);

    if (!player) {
      throw new ApiError(
        400,
        "Man of the Tournament must be a player from one of the top teams."
      );
    }

    // create tournament result
    const result = await TournamentResult.create(
      [
        {
          tournamentId,
          result: {
            champion,
            runnerUp,
            thirdPlace,
          },
          manOfTheTournament,
          awardFor,
          photo: null,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // return response
    res
      .status(201)
      .json(
        new ApiResponse(201, result, "Tournament result created successfully")
      );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});
