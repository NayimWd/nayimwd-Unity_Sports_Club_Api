import { info } from "console";
import { Innings } from "../../models/matchModel/innings.model";
import { Match } from "../../models/matchModel/match.model";
import { MatchResult } from "../../models/matchModel/matchResult.model";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";

export const getMatchResult = asyncHandler(async (req, res) => {
  // get matchId from req params
  const { matchId } = req.params;
  if (!matchId) {
    throw new ApiError(400, "Please provide matchId");
  }

  // check if match exists
  const match = await Match.findById(matchId);
  if (!match) {
    throw new ApiError(404, "Match not found");
  }

  // fetch match result
  const matchResult = await MatchResult.findOne({ matchId })
    .populate({
      path: "winner",
      select: "teamName teamLogo",
    })
    .populate({
      path: "defeated",
      select: "teamName teamLogo",
    })
    .populate({
      path: "manOfTheMatch",
      select: "name photo",
    });

  if (!matchResult) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { message: "Match result not recorded yet", result: null },
          "No match result"
        )
      );
  }

  // fetch schedule
  const schedule = await Schedule.findOne({ matchId });
  // fetch innings
  const [innings1, innings2] = await Promise.all([
    await Innings.findOne({ matchId, inningsNumber: 1 }),
    await Innings.findOne({ matchId, inningsNumber: 2 }),
  ]);

  const result = {
    result: matchResult,
    innings1: innings1 ? innings1 : null,
    innings2: innings2 ? innings2 : null,
    schedule: schedule ? schedule : null,
  };

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Match result fetched successfully"));
});
