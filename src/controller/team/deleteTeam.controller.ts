import { Team } from "../../models/teamModel/teams.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const deleteTeam = asyncHandler(async (req, res) => {
  // get manager id
  const userId = (req as any).user._id;
  if (!userId) {
    throw new ApiError(400, "Invalid token, user not found");
  }

  // get team id from query parameter
  const { teamId } = req.query;
  if(!teamId){
    throw new ApiError(400, "Team ID Required");
  }

  // find team by team id
  const deleteTeam = await Team.findOneAndDelete({ _id: teamId, managerId: userId });
  if(!deleteTeam){
    throw new ApiError(404, "Team do not exist")
  };

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Team deleted successfully"));
});
