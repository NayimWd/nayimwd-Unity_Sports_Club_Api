import { Match } from "../../models/matchModel/match.model";
import { User } from "../../models/userModel/user.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const updateUmpire = asyncHandler(async (req, res) => {
  // authenticate and authorize user
  const author = (req as any).user;
  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to update match status");
  }

  // extract data from request
  const { tournamentId, matchId } = req.params;
  const { umpireIds } = req.body;

  // validate inputs
  if (!tournamentId || !matchId || !Array.isArray(umpireIds)) {
    throw new ApiError(
      400,
      "Please provide tournament ID, match ID and umpires"
    );
  }

  if (umpireIds.length < 2) {
    throw new ApiError(400, "Please provide at least two umpires");
  }

  // fetch match
  const match = await Match.findOne({ _id: matchId, tournamentId });
  if (!match) {
    throw new ApiError(404, "Match not found");
  }

  // prevent updating umpires for completed or cancelled matches
  if (["in-progress", "completed", "cancelled"].includes(match.status)) {
    throw new ApiError(
      400,
      "Cannot update umpires for completed or cancelled matches"
    );
  }

  // check if the umpires exist
  const existingUmpires = await User.find({
    _id: { $in: umpireIds },
    role: "umpire",
  });
  if (existingUmpires.length !== umpireIds.length) {
    throw new ApiError(404, "One or more umpires not exist");
  }

  // update umpires
  match.umpires =
    umpireIds.length === 2
      ? { firstUmpire: umpireIds[0], secondUmpire: umpireIds[1] }
      : {
          firstUmpire: umpireIds[0],
          secondUmpire: umpireIds[1],
          thirdUmpire: umpireIds[2],
        };

  await match.save();

  // return response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { umpires: match.umpires },
        "Umpires updated successfully"
      )
    );
});
