import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";

export const createTeam = asyncHandler(async(req, res)=>{
    const user = (req as any).user;
    if(!user){
        throw new ApiError(400, "Invalid Token, User not found")
    };
    // authorize manager to create team
    if(user.role !== "manager"){
        throw new ApiError(401, "Only manager can create team")
    };

    
})