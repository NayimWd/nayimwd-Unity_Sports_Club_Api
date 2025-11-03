import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";

export const updatePlayerProfile = asyncHandler(async (req, res) => {
  const player = (req as any).user;
  if (!player || !player._id) {
    throw new ApiError(400, "Invalid token, user not found");
  }
});
