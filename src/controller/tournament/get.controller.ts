import { PointTable } from "../../models/point table/pointTables.model";
import { TournamentResult } from "../../models/tournamentModel/tournamentResult.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const getAllTournaments = asyncHandler(async (req, res) => {
  const tournaments = await Tournament.find()
    .select("tournamentName tournamentType seats status entryFee photo")
    .lean();

  // validate data
  if (!tournaments) {
    throw new ApiError(400, "No tournaments found");
  }

  // get total
  const total = await Tournament.countDocuments();
  // send response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total: total,
        tournaments,
      },
      "All tournaments fetched successfully"
    )
  );
});

// get ongoing tournaments
export const getTournamentsByStatus = asyncHandler(async (req, res) => {
  // get status from request
  const { status } = req.query as { status?: string };

  const isValidStatus = ["upcoming", "ongoing", "completed"].includes(
    status as string
  );

  const filter: { status?: string } = isValidStatus ? { status: status } : {};

  const tournaments = await Tournament.find(filter)
    .sort({ createdAt: -1 })
    .select(
      "tournamentName tournamentType seats status entryFee photo startDate endDate"
    )
    .lean();

  // validate data
  if (!tournaments) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          total: 0,
          tournaments,
        },
        "No Tournament Found!"
      )
    );
  }

  // send response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total: tournaments.length,
        tournaments,
      },
      "Ongoing tournaments fetched successfully"
    )
  );
});

// get tournament by id
export const getTournamentById = asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;
  if (!tournamentId) {
    throw new ApiError(400, "Tournament id is required");
  }

  const tournament = await Tournament.findById(tournamentId);

  // validate data
  if (!tournament) {
    throw new ApiError(400, "No tournament found");
  }

  // fetch tournament result
  const result = await TournamentResult.findOne({ tournamentId })
    .populate("result.champion", "teamName teamLogo")
    .populate("result.runnerUp", "teamName teamLogo")
    .populate("result.thirdPlace", "teamName teamLogo")
    .populate("manOfTheTournament", "name photo")
    .lean();

  // build response
  const response = {
    tournament,
    result: result ? result : "Tournament is not completed yet",
  };

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, response, "Tournament Fetched successfully"));
});

// get latest tournament
export const getLatestTournament = asyncHandler(async (req, res) => {
  // fetch the latest tournament by status
  const latestTournament = await Tournament.findOne({
    status: { $in: ["ongoing", "completed"] },
  })
    .sort({ createdAt: -1 })
    .select("_id tournamentName status")
    .lean();

  if (!latestTournament) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "No completed or ongoing tournament available"
        )
      );
  }

  //  if the latest tournament is ongoing, check point table
  if (latestTournament.status === "ongoing") {
    const pointTable = await PointTable.findOne({
      tournamentId: latestTournament._id,
    });

    if (pointTable) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, latestTournament, "Latest ongoing tournament")
        );
    }

    // if ongoing has not point table latest completed tournament
    const latestCompleted = await Tournament.findOne({ status: "completed" })
      .sort({ createdAt: -1 })
      .select("_id tournamentName status")
      .lean();

    if (!latestCompleted) {
      return res
        .status(200)
        .json(new ApiResponse(200, null, "No tournament available"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, latestCompleted, "Latest completed tournament")
      );
  }

  // If the latest tournament is complete
  return res
    .status(200)
    .json(
      new ApiResponse(200, latestTournament, "Latest completed tournament")
    );
});

export const tournamentDetails = asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;
  if (!tournamentId) {
    throw new ApiError(400, "Tournament id is required");
  }

  const tournament = await Tournament.findById(tournamentId);

  // validate data
  if (!tournament) {
    throw new ApiError(400, "No tournament found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, tournament, "Tournament Details Found Successfully")
    );
});
