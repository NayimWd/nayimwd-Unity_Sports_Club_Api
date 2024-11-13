import { User } from "../../models/userModel/user.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const updateAccount = asyncHandler(async (req, res) => {
  // get user Id
  const userId = (req as any).user._id;
  if (!userId) {
    throw new ApiError(404, "Invalid token, user not found");
  }
  // get update fields
  const { name, phoneNumber } = req.body;
  if (!name || !phoneNumber) {
    throw new ApiError(400, "details is missing for update account details");
  }

  // find and update user
  const updateDetails = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        name,
        phoneNumber,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updateDetails,
        "Account details updated successfully"
      )
    );
});
