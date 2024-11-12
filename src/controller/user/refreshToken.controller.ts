import { User } from "../../models/userModel/user.model";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { generateAccessAndRefreshToken } from "./login.controller";
import { ApiResponse } from "../../utils/ApiResponse";

export const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Ensure secret key is available
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!refreshTokenSecret) {
      throw new ApiError(500, "Access token secret not configured");
    }

    // decode token
    let decodedToken;
    try {
      // verify token
      decodedToken = jwt.verify(incomingRefreshToken, refreshTokenSecret);
    } catch (error) {
      throw new ApiError(401, "Error while decoding token");
    }

    // get user from token
    const user = await User.findById((decodedToken as any)._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // match Incoming token with user token
    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh Token is Expired");
    }

    //generate access and refresh token
    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      (user as any)._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed!"
        )
      );
  } catch (err) {
    throw new ApiError(401, (err as any)?.message || "Invalid refresh token");
  }
});
