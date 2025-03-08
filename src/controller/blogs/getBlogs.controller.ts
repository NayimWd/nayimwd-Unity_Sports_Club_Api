import { Blog } from "../../models/blog/blog.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

 export const getAllBlogs = asyncHandler(async(req, res)=>{
    // Extract query parameters
 let { page, limit, search, sort, tags } = req.query;

 // Default values
 const pageNumber = parseInt(page as string) || 1;
 const pageSize = parseInt(limit as string) || 12;
 const skip = (pageNumber - 1) * pageSize;

 // Construct search filter
 const filter: any = { isPublished: true }; // Only fetch published blogs
 if (search) {
   filter.title = { $regex: search, $options: "i" }; // Case-insensitive search
 }
 if (tags) {
   filter.tags = tags; // Exact tag match
 }

 // Sorting logic
 let sortOption: any = { createdAt: -1 }; // Default: latest first
 if (sort === "oldest") sortOption = { createdAt: 1 };

 // Fetch blogs
 const blogs = await Blog.find(filter)
   .sort(sortOption)
   .skip(skip)
   .limit(pageSize)
   .lean(); // Optimizes read performance

 // Total count for pagination
 const totalBlogs = await Blog.countDocuments(filter);
 const totalPages = Math.ceil(totalBlogs / pageSize);

 if (blogs.length === 0) {
   throw new ApiError(404, "No blogs found");
 }

 // Return response
 res.status(200).json(
   new ApiResponse(200, {
     blogs,
     pagination: {
       totalBlogs,
       totalPages,
       currentPage: pageNumber,
       pageSize,
     },
   }, "Blogs fetched successfully")
 );
 })