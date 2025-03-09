import { Blog } from "../../models/blog/blog.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const blogPublish = asyncHandler(async (req, res) => {
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

  // get blogId and data from req params and body
  const { blogId } = req.params;
  const { isPublished } = req.body;
  if (!blogId) {
    throw new ApiError(400, "Blog Id is required");
  }

  // check if blog exists
  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  // update blog
  const updatedBlog = await Blog.findByIdAndUpdate(
    blogId,
    { isPublished: isPublished },
    { new: true }
  );
  if (!updatedBlog) {
    throw new ApiError(400, "Blog update failed");
  }

  // send response
  return res
    .status(200)
    .json(new ApiResponse(200, updatedBlog.isPublished, "Blog updated successfully"));
});
