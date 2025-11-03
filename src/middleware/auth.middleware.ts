import { User } from "../models/userModel/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";

export const veryfyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Get token from cookie or request header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // Check for the token
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Ensure the secret key is available
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    if (!accessTokenSecret) {
      throw new ApiError(500, "Access token secret not configured");
    }

    let decodedToken;

    try {
      // Verify token
      decodedToken = jwt.verify(token, accessTokenSecret);
    } catch (error) {
      throw new ApiError(401, "Invalid or expired token");
    }

    // Find the user by decoded token ID
    const user = await User.findById((decodedToken as any)._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    // Attach the user to the request
    (req as any).user = user;

    next();
  } catch (error) {
    throw new ApiError(401, (error as Error)?.message || "Invalid AccessToken");
  }
});

// admin auth
export const isAdmin = asyncHandler(async (req, res, next) => {
  if ((req as any).user?.role !== "admin") {
    return res.status(401).json({
      success: false,
      message: "This user is not admin",
    });
  }
  next();
});

// manager auth
export const isManager = asyncHandler(async (req, res, next) => {
  if ((req as any).user?.role !== "manager") {
    return res.status(401).json({
      success: false,
      message: "This user is not team manager",
    });
  }
  next();
});
