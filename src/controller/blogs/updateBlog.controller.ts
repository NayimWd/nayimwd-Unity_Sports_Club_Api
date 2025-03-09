import { Blog } from "../../models/blog/blog.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const updateBlog = asyncHandler(async (req, res) => {
  // authenticate and authorize
  const writer = (req as any).user;
  if (!writer || !["admin", "staff"].includes(writer.role)) {
    throw new ApiError(403, "You are not authorized to update this blog");
  }

  // extract data from req body and params
  const { blogId } = req.params;
  const { title, content, tags } = req.body;

  // Validate data
  if (!blogId) {
    throw new ApiError(400, "blogId required");
  }

  // Validate incoming fields
  if (!title && !content && !tags) {
    throw new ApiError(
      400,
      "At least one field (title, content, tags) must be provided for update"
    );
  }

  // check if the blog exists
  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  // Validate title length
  if (title && (title.length < 10 || title.length > 500)) {
    throw new ApiError(400, "Title must be between 10 and 500 characters");
  }

  // Validate content length
  if (content && content.trim().length === 0) {
    throw new ApiError(400, "Content cannot be empty");
  }

  // Validate tags
  const validTags = ["news", "highlight", "tournaments", "awards"];
  if (tags && !validTags.includes(tags)) {
    throw new ApiError(400, "Invalid tag provided");
  }

  // update blog
  const updateBlog = await Blog.findByIdAndUpdate(
    blogId,
    {
      title: title || blog.title,
      content: content || blog.content,
      tags: tags || blog.tags,
    },
    { new: true }
  );

  if (!updateBlog) {
    throw new ApiError(500, "Blog update failed");
  }

  // return response
  res
    .status(200)
    .json(new ApiResponse(200, null, "Blog updated successfully"));
});
