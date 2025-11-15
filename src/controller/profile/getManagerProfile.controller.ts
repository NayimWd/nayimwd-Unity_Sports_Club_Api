import { ManagerProfile } from "../../models/profilesModel/managerProfile.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const getManagerProfile = asyncHandler(async (req, res) => {
  // token validation
  const managerId = (req as any).user._id;
  if (!managerId) {
    throw new ApiError(400, "Invalid token, User not found");
  }

  // fetch profile
  const profile = await ManagerProfile.findOne({ userId: managerId })
    .populate({
      path: "userId",
      select: "name photo",
    })
    .populate({
      path: "teamsManaged",
      select: "teamName, teamLogo",
    });

  // return response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        profile || null,
        profile
          ? "Manager profile fetched successfully"
          : "Manager profile not found"
      )
    );
});
