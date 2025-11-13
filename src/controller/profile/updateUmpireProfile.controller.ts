import { UmpireProfile } from "../../models/profilesModel/umpireProfile.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const updateUmpireProfile = asyncHandler(async (req, res) => {
  const umpire = (req as any).user;

  if (!umpire._id) {
    throw new ApiError(400, "Invalid Token, User Not found");
  }

  // validate umpire role
  if (umpire.role !== "umpire") {
    throw new ApiError(403, "You are not Umpire");
  }

  const allowedFields = ["yearsOfExperience", "photo"];
  const updates: Record<string, any> = {};

  //  valid updates only
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  //  at least one field
  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "At least one field is required to update");
  }

  //  atomic update
  const updatedProfile = await UmpireProfile.findOneAndUpdate(
    { userId: umpire._id },
    { $set: updates },
    { new: true, runValidators: true }
  ).populate({ path: "userId", select: "name photo" });

  if (!updatedProfile) {
    throw new ApiError(404, "Umpire profile not found");
  }

  // return updated profile
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedProfile,
        "Umpire profile updated successfully"
      )
    );
});
