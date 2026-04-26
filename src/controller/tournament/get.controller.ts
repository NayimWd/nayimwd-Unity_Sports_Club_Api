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

// get  tournament for search & select
export const SearcableTournaments = asyncHandler(async (req, res) => {
  const tournaments = await Tournament.find({
    status: { $in: ["upcoming", "ongoing"] },
  })
    .select("_id tournamentName")
    .limit(5)
    .sort({ createdAt: -1 })
    .lean();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        tournaments,
        tournaments.length
          ? "Tournaments fetched successfully"
          : "No tournaments found"
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

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, tournament, "Tournament Fetched successfully"));
});

// get latest tournament
export const getLatestTournament = asyncHandler(async (req, res) => {
  const { status } = req.query as { status?: string };

  const validStatuses = ["upcoming", "ongoing", "completed"];
  const isValidStatus = status && validStatuses.includes(status);

  // if status send 
  if (isValidStatus) {
    const tournament = await Tournament.findOne({ status })
      .sort({ createdAt: -1 })
      .select("_id status tournamentName")
      .lean();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          tournament || null,
          tournament
            ? `Latest ${status} tournament`
            : `No ${status} tournament found`
        )
      );
  }

 // if status not send 
  //  find latest ongoing
  const latestOngoing = await Tournament.findOne({ status: "ongoing" })
    .sort({ createdAt: -1 })
    .select("_id status tournamentName")
    .lean();

  if (latestOngoing) {
    const pointTable = await PointTable.findOne({
      tournamentId: latestOngoing._id,
    }).lean();

    if (pointTable) {
      return res
        .status(200)
        .json(new ApiResponse(200, latestOngoing, "Latest ongoing tournament"));
    }
  }

  //  if not ongoing found - latest completed
  const latestCompleted = await Tournament.findOne({ status: "completed" })
    .sort({ createdAt: -1 })
    .select("_id status tournamentName")
    .lean();

  if (latestCompleted) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, latestCompleted, "Latest completed tournament")
      );
  }

  //  nothing found
  return res
    .status(200)
    .json(new ApiResponse(200, null, "No tournament available"));
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

export const upcomingTournament = asyncHandler(async (req, res) => {
  const tournament = await Tournament.find({ status: "upcoming" })
    .select(
      "champion entryFee runnerUp startDate tournamentName registrationDeadline tournamentType"
    )
    .lean();

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
