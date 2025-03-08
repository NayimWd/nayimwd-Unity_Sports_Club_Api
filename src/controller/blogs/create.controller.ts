import { Blog } from "../../models/blog/blog.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { uploadOnCloudinary } from "../../utils/cloudinary";

export const createBlog = asyncHandler(async (req, res) => {
  // authenticate and authorize
  const writer = (req as any).user;
  if (!writer || !["admin", "staff"].includes(writer.role)) {
    throw new ApiError(
      403,
      "Invalid Token, You are not authorized to create innings"
    );
  }

  // extract data from req body
  const { title, content, author, tags, isPublished } = req.body;
  if (!title || !content || !tags || !isPublished) {
    throw new ApiError(400, "All fields are required");
  }

  // Validate title and content length
  if (title.length < 10 || title.length > 500) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Title must be between 10 and 500 characters",
      });
  }
  if (!content || content.trim().length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Content cannot be empty" });
  }

  // Validate tag
  const validTags = ["news", "highlight", "tournaments", "awards"];
  if (!validTags.includes(tags)) {
    return res.status(400).json({ success: false, message: "Invalid tag" });
  }

   // get photo from request file
    const photoLocalPath = req.file?.path;
  
    if (!photoLocalPath) {
      throw new ApiError(400, "Photo is required");
    }
  
    // upload photo to cloudinary
    const photo = await uploadOnCloudinary(photoLocalPath);
    if (!photo) {
      throw new ApiError(400, "Upload photo failed");
    }

  // create blog
  const blog = await Blog.create({
    title: title,
    content: content,
    author: writer.name,
    tags: tags,
    createdAt: new Date(),
    likes: 0,
    isPublished: isPublished,
    photo: photo.url
  });

  if (!blog) {
    throw new ApiError(500, "Blog creation failed");
  }

  // return response
  res.status(201).json(new ApiResponse(201, blog, "Blog created successfully"));
});
