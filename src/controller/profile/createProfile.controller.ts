import { PlayerProfile } from "../../models/profilesModel/playerProfile.model";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";

export const createProfile = asyncHandler(async(req, res)=>{
    const user = (req as any).user;

    // validate user
    if(!user._id){
        throw new ApiError(404, "Invalid token, user not found")
    }

    // get id from params
    const {profileId} = req.query;

    // create player profile
    if(user.role === "player"){
        // check profile already exist or not
        const existingPlayerProfile = await PlayerProfile.findById({_id: user._id});

        if(existingPlayerProfile){
            throw new ApiError(409, "Profile already exists");
        };

    
    

    }

 

})