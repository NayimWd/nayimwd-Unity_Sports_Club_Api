import { ManagerProfile } from "../../models/profilesModel/managerProfile.model";
import { PlayerProfile } from "../../models/profilesModel/playerProfile.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const getProfileDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // validate
  if (!id) {
    throw new ApiError(400, "ID is required");
  }

  // try fetch profile details as player
  const playerProfile = await PlayerProfile.findById(id).populate({
    path: "userId",
    select: "name photo",
  });

  // if player profile found try fetch manager profile
  if (!playerProfile) {
    const managerProfile = await ManagerProfile.findOne({
      userId: id,
    }).populate({
      path: "userId",
      select: "name photo",
    });

    if (managerProfile === null) {
      throw new ApiError(404, "Profile not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          managerProfile,
          "Manager Profile found successfully"
        )
      );
  }

  // return player profile
  return res
    .status(200)
    .json(
      new ApiResponse(200, playerProfile, "Player Profile found successfully")
    );
});
