import { TeamPlayer } from "../../models/teamModel/teamPlayer.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const playersOfMatch = asyncHandler(async(req, res)=> {
    const {teamId} = req.params;

    if(!teamId){
       throw new ApiError(400, "Match Id is required")
    }

    const players = await TeamPlayer.find({teamId: teamId})
    .select("playerId")
    .populate({
        path: "playerId",
        select: "name"
    })
    .lean();

    if(!players){
        throw new ApiError(404, "No Player found")
    }

    return res.status(200).json(
        new ApiResponse(200, players, "Team")
    )

})