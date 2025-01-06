import { UmpireProfile } from "../../models/profilesModel/umpireProfile.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const getUmpireProfile = asyncHandler(async (req, res) => {
  const umpireId = (req as any).user._id;
  if (!umpireId) {
    throw new ApiError(400, "Invalid token, umpire not found");
  }
  // find profile
  const profile = await UmpireProfile.findOne({ userId: umpireId }).populate({
    path: "userId",
    select: "name photo",
  });

  if (!profile) {
    throw new ApiError(404, "Umpire profile not found");
  }

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, profile, "Umpire profile found successfully"));
});
