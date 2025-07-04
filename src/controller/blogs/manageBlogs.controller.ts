import { Blog } from "../../models/blog/blog.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const manageBlogs = asyncHandler(async(req, res)=> {
    // author validation 
  const author = (req as any)?.user;
  if(!author || !["admin", "staff"].includes(author.role)){
    throw new ApiError(403, "You are not authorized to manage blogs")
  }

    // Extract query parameters
  let { page, limit, search, sort, tags } = req.query;

  // Default values
  const pageNumber = Math.max(parseInt(page as string) || 1, 1);
  const pageSize = Math.max(parseInt(limit as string) || 12, 1);
  const skip = (pageNumber - 1) * pageSize;

  const filter: any = {};

  // Use full-text search
  if (search) {
    filter.$text = { $search: search };
  }

  if (tags) {
    filter.tags = tags; // Exact match
  }

  // Sorting logic
  let sortOption: any = { createdAt: -1 }; // Default: latest first
  if (sort === "oldest") sortOption = { createdAt: 1 };

  // Fetch blogs & total count in a single query using aggregation
  const [blogs, totalBlogs] = await Promise.all([
    Blog.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize)
      .select("title tags author createdAt photo, isPublished") // Only fetch required fields
      .lean(), // Optimized read performance

    Blog.countDocuments(filter), // Total count for pagination
  ]);

  if (!blogs.length) {
    throw new ApiError(404, "No blogs found");
  }

  // Return response
  res.status(200).json(
    new ApiResponse(
      200,
      {
        blogs,
        pagination: {
          totalBlogs,
          totalPages: Math.ceil(totalBlogs / pageSize),
          currentPage: pageNumber,
          pageSize,
        },
      },
      "Blogs fetched successfully"
    )
  );

})