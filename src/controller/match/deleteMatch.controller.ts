import { Match } from "../../models/matchModel/match.model";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { VenueBooking } from "../../models/venueModel/venueBooking.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const deleteMatch = asyncHandler(async (req, res) => {
  // authenticate and authorize user
  const author = (req as any).user;
  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to delete a match");
  }

  // extract data from request
  const { matchId } = req.params;
  // validate inputs
  if (!matchId) {
    throw new ApiError(400, "Please provide tournament ID and match ID");
  }

  // check match exists
  const match = await Match.findById({ _id: matchId });

  if (!match) {
    throw new ApiError(404, "Match not found");
  }

  // check match status
  if (["in-progress", "completed"].includes(match.status)) {
    throw new ApiError(
      400,
      `Match cannot be deleted as it is already ${match.status}`
    );
  }

  // find associated schedule
  const schedule = await Schedule.findOne({ matchId });
  if (!schedule) {
    throw new ApiError(404, "Schedule not found for this match");
  }

  // find associated venue booking
  const venueBooking = await VenueBooking.findOne({
    venueId: schedule.venueId,
    bookingDate: schedule.matchDate,
    startTime: schedule.matchTime,
  });

  // delete match, schedule and venue booking
  await Promise.all([
    Match.findByIdAndDelete(matchId),
    Schedule.findOneAndDelete({ matchId }),
    venueBooking && VenueBooking.findByIdAndDelete(venueBooking._id),
  ]);

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Match deleted successfully"));
});
