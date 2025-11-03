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

    // extract query parameters
  let { page, limit, search, sort, tags, isPublished } = req.query;

  // Default values
  const pageNumber = Math.max(parseInt(page as string) || 1, 1);
  const pageSize = Math.max(parseInt(limit as string) || 12, 1);
  const skip = (pageNumber - 1) * pageSize;

  const filter: any = {};

  // use full-text search
  if (search) {
  filter.title = { $regex: search, $options: "i" };
}

  if (tags) {
    filter.tags = tags; // exact match
  }

   // optional isPublished filter
  if (isPublished === "true") filter.isPublished = true;
  if (isPublished === "false") filter.isPublished = false;


  // Sorting logic
  let sortOption: any = { createdAt: -1 }; // default: latest first
  if (sort === "oldest") sortOption = { createdAt: 1 };

  // fetch blogs & total count in a single query using aggregation
  const [blogs, totalBlogs] = await Promise.all([
    Blog.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize)
      .select("title tags author createdAt photo isPublished") // fetch required fields
      .lean(), 

    Blog.countDocuments(filter), // total count for pagination
  ]);


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