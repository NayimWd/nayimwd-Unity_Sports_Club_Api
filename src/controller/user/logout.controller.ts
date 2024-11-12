import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { User } from "../../models/userModel/user.model";
import { ApiResponse } from "../../utils/ApiResponse";

export const logoutUser = asyncHandler(async(req: Request, res:Response)=>{
    // get user id from middleware
    const userId = (req as any).user._id;
    if(!userId){
        throw new ApiError(404, "Invalid token")
    }
    // logout
    await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
      };

    return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(
                new ApiResponse(
                    200, 
                    {},
                    "User Logged out"
                )
            )
      
})