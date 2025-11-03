import { match } from "assert";
import { Match } from "../../models/matchModel/match.model";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";

export const getMatchTeams = asyncHandler(async (req, res) => {
  // get matchId
  const { matchId } = req.params;
  // validate
  if (!matchId) {
    throw new ApiError(400, "Match Id required");
  }

  // check if match exists
  const match = await Match.findById(matchId)
    .select("matchNumber teamA teamB")
    .populate({
      path: "teamA",
      model: "Team",
      select: "teamName teamLogo",
    })
    .populate({
      path: "teamB",
      model: "Team",
      select: "teamName teamLogo",
    });

  // reteurn response
  return res
    .status(200)
    .json(new ApiResponse(200, match, "teams fetched successfully"));
});
