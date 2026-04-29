import { Match } from "../../models/matchModel/match.model";
import { UmpireProfile } from "../../models/profilesModel/umpireProfile.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const umpireSummary = asyncHandler(async (req, res) => {
  const umpireId = (req as any).user?._id;

  // validate
  if (!umpireId) {
    throw new ApiError(400, "Valid umpire id is required");
  }

  const [
    profile,
    totalFirstUmpire,
    totalSecondUmpire,
    totalThirdUmpire,
  ] = await Promise.all([
    // experience
    UmpireProfile.findOne({ userId: umpireId })
      .select("yearsOfExperience")
      .lean(),

    // counts
    Match.countDocuments({ "umpires.firstUmpire": umpireId }),
    Match.countDocuments({ "umpires.secondUmpire": umpireId }),
    Match.countDocuments({ "umpires.thirdUmpire": umpireId }),
  ]);

  const totalMatchesDirected =
    totalFirstUmpire + totalSecondUmpire + totalThirdUmpire;

  return res.status(200).json(
    new ApiResponse(200, {
      yearsOfExperience: profile?.yearsOfExperience || 0,
      totalFirstUmpire,
      totalSecondUmpire,
      totalThirdUmpire,
      totalMatchesDirected,
    }, "Umpire summary fetched successfully")
  );
});