import { Team } from "../../models/teamModel/teams.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const getAllTeams = asyncHandler(async (req, res) => {
  // get and parse page and limit from query
  const page = parseInt((req as any).query.page as string, 10) || 1;
  const limit = parseInt((req as any).query.limit as string) || 20;
  const skip = (page - 1) * limit;

  // fetch teams with pagination
  const teams = await Team.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("_id teamName teamLogo")


  // total count of team for pagination
  const totalTeams = await Team.countDocuments();

  // response with paginated data
  const response = {
    totalTeams,
    totalPages: Math.ceil(totalTeams / limit),
    currentPage: page,
    teams,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Teams fetched successfully"));
});

// single team controller
export const getTeamDetails = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  const team = await Team.findById(teamId)
  .populate("managerId", "name email")

  if (!team) {
    throw new ApiError(404, "No Team found under this id");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, team, "Team found successfully"));
});


export const getMyteam = asyncHandler(async(req, res)=>{
  // get manager id
  const userId = (req as any).user._id;
  if(!userId){
    throw new ApiError(400, "Invalid token, user not found")
  }
  
  const team = await Team.findOne({managerId: userId});

  if(!team){
    throw new ApiError(404, "You do not have any team yet!")
  };

  return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              team,
              "Team fetched successfully"
            )
          )

})
