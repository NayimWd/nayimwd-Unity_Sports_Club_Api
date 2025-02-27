import { asyncHandler } from "../../utils/asyncHandler";

export const getAllInnings = asyncHandler(async(req, res)=>{
    // get data from req body 
    const {tournamentId} = req.params;
});