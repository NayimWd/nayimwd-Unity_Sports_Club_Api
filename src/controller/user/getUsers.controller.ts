import { User } from "../../models/userModel/user.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const getCurrentUser = asyncHandler(async (req, res) => {
  // getting  user from token via middleware
  const user = (req as any).user;

  if (!user) {
    throw new ApiError(404, "Invalid Token, user not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "current user fatched successfully"));
});

// get all user
export const getAllUsers = asyncHandler(async (req, res) => {
  // get current user from token via middleware
  const user = (req as any).user;

  // condition for getting all users
  if (!["admin", "staff"].includes(user.role)) {
    throw new ApiError(401, "Unauthorized request");
  }

  // adding pagination, search, sort
  const page = parseInt((req as any).query.page as string) || 1;
  const limit = parseInt((req as any).query.limit as string) || 15;
  const nameSearch = (req as any).query.name
    ? { name: { $regex: (req as any).query.name, $options: "i" } }
    : {};
  const emailSearch = (req as any).query.email
    ? { email: { $regex: (req as any).query.email, $options: "i" } }
    : {};
  const roleSearch = (req as any).query.role
    ? { role: { $regex: (req as any).query.role, $options: "i" } }
    : {};
  const sortField = (req as any).query.sortField || "name";
  const sortOrder = (req as any).query.sortOrder === "desc" ? -1 : 1;

  // combining search query
  const matchQuery = {
    ...roleSearch,
    ...nameSearch,
    ...emailSearch,
  };

  // aggegration pipeline stages
  const pipeline: any[] = [];

  // stage 1 - match search for filtering users
  pipeline.push({ $match: matchQuery });

  // stage 2 - sort
  pipeline.push({ $sort: { [sortField]: sortOrder } });

  // stage 3 - pagination
  const skip = (page - 1) * limit;
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  // get total user count for search / pagination
  const totalUsers = await User.countDocuments(matchQuery);

  // execute aggregation
  const allUsers = await User.aggregate(pipeline);
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        All_users: allUsers.length,
        users: allUsers,
        pagination: {
          totalUsers,
          currentPage: page,
          totalPages: Math.ceil(totalUsers / limit),
        },
      },
      "All users fetched successfully"
    )
  );
});
