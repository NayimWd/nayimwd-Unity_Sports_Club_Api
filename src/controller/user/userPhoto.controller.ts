import { User } from "../../models/userModel/user.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { uploadOnCloudinary } from "../../utils/cloudinary";

export const updateUserPhoto = asyncHandler(async (req, res) => {
  // get currect user ID
  const userId = (req as any).user;
  if (!userId) {
    throw new ApiError(404, "Invalid Token, User not found");
  }

  // getting photo for update
  const photoLocalPath = req.file?.path;
  if (!photoLocalPath) {
    throw new ApiError(400, "Photo file is missing");
  }

  // uploading on cloudinary
  const photo = await uploadOnCloudinary(photoLocalPath);
  if (!photo?.url) {
    throw new ApiError(400, "Error while updating photo");
  }

  // update photo
  await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        photo: photo.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Photo Updated Successfully"));
});
