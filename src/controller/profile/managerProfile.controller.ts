import { ManagerProfile } from "../../models/profilesModel/managerProfile.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const createManagerProfile = asyncHandler(async (req, res) => {
  // checking auth for manager
  const manager = (req as any).user;
  // validate
  if (!manager || !manager._id) {
    throw new ApiError(400, "Invalid token, user not found");
  }

  // role validation for manager
  if (manager.role !== "manager") {
    throw new ApiError(403, "user role is not manager");
  }

  // getting data from req body
  const { teamId } = req.body;

  // validate
  if (!teamId) {
    throw new ApiError(400, "Team ID field is missing");
  }

  try {
    const profile = await ManagerProfile.create({
      userId: manager._id,
      teamsManaged: [teamId],
    });

    return res.status(201).json(
      new ApiResponse(201, profile, "Profile created successfully")
    );
  } catch (err: any) {
    if (err.code === 11000) {
      throw new ApiError(409, "Profile already exists");
    }
    throw err;
  }
});
