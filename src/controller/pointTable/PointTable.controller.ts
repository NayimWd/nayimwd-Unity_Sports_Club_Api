import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";

export const getPointTable = asyncHandler(async (req, res) => {
    // get tournamentId from req params
    const {tournamentId} = req.params;
    if(!tournamentId){
        throw new ApiError(400, "Please provide tournamentId");
    };

    // check if tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if(!tournament){
        throw new ApiError(404, "Tournament not found");
    };

    // fetch point table
    
});