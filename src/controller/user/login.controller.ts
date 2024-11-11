import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { User } from "../../models/userModel/user.model";
import { ApiResponse } from "../../utils/ApiResponse";

export const generateAccessAndRefreshToken = async (userId: string) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // generate access and refresh token
    const accessToken = await user?.generateAccessToken();
    const refreshToken = await user?.generateRefreshToken();

    // save refresh token to db
    user.refreshToken = refreshToken;

    await user?.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(500, "generate refresh and access token failed!");
  }
};

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  // get login credintials
  const { email, password } = req.body;
  // validate credintials
  if (!email || !password) {
    throw new ApiError(400, "Username or password is required");
  }

  // find user by email
  const existingUser = await User.findOne({ email });
  // validate
  if (!existingUser) {
    throw new ApiError(404, "User does not exists");
  }

  // validate password
  const validPassword = await existingUser.isPasswordCorrect(password);

  if (!validPassword) {
    throw new ApiError(401, "Invalid user credintials");
  }

  // generating tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    (existingUser as any)._id
  );

  // Convert the Mongoose document to a plain object and omit sensitive fields
  const {
    password: _,
    refreshToken: __,
    ...loginUser
  } = existingUser.toObject();

  // set cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loginUser,
          accessToken,
          refreshToken,
        },
        "User Logged In Successfully"
      )
    );
});
