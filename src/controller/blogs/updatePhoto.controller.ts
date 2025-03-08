import { Blog } from "../../models/blog/blog.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { uploadOnCloudinary } from "../../utils/cloudinary";

export const updateBlogPhoto = asyncHandler(async (req, res) => {
  // authorize with token
  const creator = (req as any).user;
  // validate
  if (!creator) {
    throw new ApiError(401, "Unauthorize request, Please Login");
  }

  // check if admin or staff
  if (!["admin", "staff"].includes(creator.role)) {
    throw new ApiError(403, "Unauthorized request to update tournament photo");
  }

  // get blogId from req params
  const { blogId } = req.params;
  if (!blogId) {
    throw new ApiError(400, "Blog Id is required");
  }

  // check if blog exists
  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  // get photo from req body
  const photoLocalPath = req.file?.path;
  if (!photoLocalPath) {
    throw new ApiError(400, "photo is required");
  }

  // upload photo on cloudinary
  const photo = await uploadOnCloudinary(photoLocalPath);

  if (!photo) {
    throw new ApiError(400, "upload photo failed");
  }

  const blogPhoto = await Blog.findByIdAndUpdate(
    blogId,
    {
      photo: photo.url,
    },
    { new: true }
  );

  if (!blogPhoto) {
    throw new ApiError(500, "Blog Photo update failed");
  }

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, blogPhoto, "Blog Photo updated successfully"));
});
