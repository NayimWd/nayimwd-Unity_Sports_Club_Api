import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { uploadOnCloudinary } from "../../utils/cloudinary";

export const updateTournamentPhoto = asyncHandler(async (req, res) => {
  // authorize with token
  const creator = (req as any).user;
  // validate
  if (!creator) {
    throw new ApiError(401, "Unauthorize request, Please Login");
  }

  // check if admin or staff
  if (!["admin", "staff"].includes(creator.role)) {
    throw new ApiError(403, "Unauthorized request to update tournament photo");
  }

  // get tournamentID from req params
  const { tournamentId } = req.params;

  if (!tournamentId) {
    throw new ApiError(400, "Tournament Id is required");
  }

  // check if tournament exists
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }

  // get photo from req body
  const photoLocalPath = req.file?.path;
  if (!photoLocalPath) {
    throw new ApiError(400, "photo is required");
  }

  // upload photo on cloudinary
  const photo = await uploadOnCloudinary(photoLocalPath);

  if (!photo) {
    throw new ApiError(400, "upload photo failed");
  }

  const tournamentPhoto = await Tournament.findByIdAndUpdate(
    tournamentId,
    {
      photo: photo.url,
    },
    { new: true }
  );

  if (!tournamentId) {
    throw new ApiError(500, "Tournament Photo update failed");
  }

  // return response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        tournamentPhoto?.photo,
        "Tournament photo updated successfully"
      )
    );
});
