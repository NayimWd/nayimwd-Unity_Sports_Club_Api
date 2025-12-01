import { Registration } from "../../models/registrationModel/registrations.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const applicationDetails = asyncHandler(async (req, res) => {
  // auth check
  const author = (req as any).user;
  if (!["admin", "staff"].includes(author?.role)) {
    throw new ApiError(401, "Unauthorized request");
  }
  // get rournament ID
  const { applicationId } = req.params;

  if (!applicationId) {
    throw new ApiError(400, "Application Id is required");
  }

  // find application details
  const application = await Registration.findById(applicationId)
    .populate({
      path: "managerId",
      model: "User",
      select: "name photo",
    })
    .populate({
      path: "teamId",
      model: "Team",
      select: "teamName",
    })
    .lean();

  if (!application) {
    throw new ApiError(404, "Application do not exists");
  }

  // return response
  return res
    .status(200)
    .json(
      new ApiResponse(200, application, "Application fetched successfully")
    );
});
