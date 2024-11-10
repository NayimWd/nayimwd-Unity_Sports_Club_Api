import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { User } from "../../models/userModel/user.model";
import { uploadOnCloudinary } from "../../utils/cloudinary";
import { ApiResponse } from "../../utils/ApiResponse";

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    // get register info
    const { name, email, password, phoneNumber, role } = req.body;

    // Validate fields
    if (
      [name, email, password, phoneNumber, role].some((field) => !field.trim())
    ) {
      throw new ApiError(400, "All fields are required for Sign Up");
    }

    // check if user exists
    const existUser = await User.findOne({ email });
    if (existUser) {
      throw new ApiError(409, "User with email already exists");
    }

 // Access avatar file (special for ts)
 const photoLocalPath = (req as any).files?.photo?.[0]?.path || (req as any).files?.[0]?.path;

    // check avtar url
    if (!photoLocalPath) {
      throw new ApiError(400, "Photo file is required");
    }

    // upload on cloudinary
    // uploading on cloudinary
  const photo = await uploadOnCloudinary(photoLocalPath);


  // validation avater
  if (!photo) {
    throw new ApiError(400, "Avatar upload went wrong!");
  }

    const register = await User.create({
      name,
      email,
      phoneNumber,
      password,
      role,
      photo: photo.url,
    });

    if (!register) {
      throw new ApiError(500, "Sign up failed");
    }


    return res
      .status(201)
      .json(new ApiResponse(200, register , "Sign up successfull"));
  }
);