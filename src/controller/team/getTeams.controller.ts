import { Team } from "../../models/teamModel/teams.model";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const getAllTeams = asyncHandler(async(req, res)=>{
    // get and parse page and limit from query
    const page = parseInt((req as any).query.page as string, 10) || 1;
    const limit = parseInt((req as any).query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // fetch teams with pagination
    const teams = await Team.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("-__v")
    .populate("managerId", "name email");

    // total count of team for pagination
    const totalTeams = await Team.countDocuments();

    // response with paginated data
    const response = {
        totalTeams,
        totalPages : Math.ceil(totalTeams / limit),
        currentPage: page,
        teams
    };

    return res
             .status(200)
             .json(
                new ApiResponse(
                    200,
                    response,
                    "Teams fetched successfully"
                )
             )
})