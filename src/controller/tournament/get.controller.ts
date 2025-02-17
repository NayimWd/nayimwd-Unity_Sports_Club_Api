import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const getAllTournaments = asyncHandler(async (req, res) => {
  const tournaments = await Tournament.find().select(
    "tournamentName tournamentType matchOver registrationDeadline seats startDate endDate status entryFee photo"
  ).lean();

  // validate data
  if (!tournaments) {
    throw new ApiError(400, "No tournaments found");
  }

  // get total 
  const total = await Tournament.countDocuments();
  // send response
  return res
    .status(200)
    .json(
      new ApiResponse(200, {
        total: total,
        tournaments
    }, "All tournaments fetched successfully")
    );
});

// get ongoing tournaments
export const getTournamentsByStatus = asyncHandler(async (req, res) => {
  // get status from request
  const { status = "ongoing" } = req.body;

  const tournaments = await Tournament.find({ status: status }).select(
    "tournamentName tournamentType matchOver registrationDeadline seats startDate endDate status entryFee photo"
  );

  // validate data
  if (!tournaments) {
    throw new ApiError(400, "No ongoing tournaments found");
  }

  // send response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
       { 
        total: tournaments.length,
         tournaments
        },
        "Ongoing tournaments fetched successfully"
      )
    );
});

// get tournament by id
export const getTournamentById = asyncHandler(async (req, res) => {
  const { tournameId } = req.params;
  if (!tournameId) {
    throw new ApiError(400, "Tournament id is required");
  };

    const tournament = await Tournament.findById(tournameId)

    // validate data
    if (!tournament) {
      throw new ApiError(400, "No tournament found");
    }

    // return response
    return res.status(200).json(
        new ApiResponse(
            200,
            tournament,
            "Tournament Fetched successfully"
        )
    )

});