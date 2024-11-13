import { User } from "../../models/userModel/user.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const changePassword = asyncHandler(async (req, res) => {
  // get old and new passwords
  const { oldPassword, newPassword } = req.body;
  // get user id by current user id
  const user = await User.findById((req as any).user._id);
  // check if user do not exist
  if (!user) {
    throw new ApiError(404, "User not exists");
  }

  // check old password is correct
  const isPassCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPassCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  // setting new password
  user.password = newPassword;
  await user?.save({ validateBeforeSave: true });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});
