import { Match } from "../../models/matchModel/match.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";


export const getMatchUmpire = asyncHandler(async(req, res)=> {
      // get matchId
  const { matchId } = req.params;
  // validate
  if (!matchId) {
    throw new ApiError(400, "Match Id required");
  }

  const response = await Match.findById(matchId)
  .select("umpires")
  .populate({
    path: "umpires.firstUmpire",
    model: "User",
    select: "_id name"
  })
  .populate({
    path: "umpires.secondUmpire",
    model: "User",
    select: "_id name"
  })
  .populate({
    path: "umpires.thirdUmpire",
    model: "User",
    select: "_id name"
  })
  .lean();


 return res.status(200).json(
    new ApiResponse(
        200,
        response._id ? response : "match umpire is not listed yet!",
        "Umpire list found successfully"
    )
 )

})