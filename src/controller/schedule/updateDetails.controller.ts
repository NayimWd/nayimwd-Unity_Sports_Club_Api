import moment from "moment";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { Venue } from "../../models/venueModel/venue.model";
import { VenueBooking } from "../../models/venueModel/venueBooking.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import mongoose from "mongoose";

export const updateDetails = asyncHandler(async (req, res) => {
  // verify author
  const author = (req as any).user;

  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to update the schedule.");
  }
  // get and validate schedule id and data about round and venue
  const { scheduleId } = req.params;
  const { newVenueId, newRound } = req.body;

  if (!scheduleId) {
    throw new ApiError(400, "Please provide a valid schedule ID.");
  }

  if (!newVenueId && !newRound) {
    throw new ApiError(400, "Provide at least one field to update.");
  }
  // validate round
  const allowedRounds = [
    "round 1",
    "round 2",
    "Quarter-Final",
    "Semi-Final",
    "Final",
    "Playoff",
  ];

  if (newRound && !allowedRounds.includes(newRound)) {
    throw new ApiError(400, "Invalid round value.");
  }
  // start session
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // validate schedule
      const schedule = await Schedule.findById(scheduleId)
      .select("status venueId tournamentId matchTime matchDate")
      .lean()
      .session(session);

      if (!schedule) {
        throw new ApiError(404, "Schedule not found.");
      }
      // validate round
      if (newRound && ["in-progress", "completed"].includes(schedule.status)) {
        throw new ApiError(
          400,
          "Cannot change the round after the match has started."
        );
      }

      const updatePayload: any = {};
      // check venue, tournament existance

      if (newVenueId && newVenueId.toString() !== schedule.venueId.toString()) {
        const [venueExists, tournament] = await Promise.all([
          Venue.exists({ _id: newVenueId }).session(session),
          Tournament.findById(schedule.tournamentId)
            .select("matchOver")
            .lean()
            .session(session),
        ]);

        if (!venueExists) {
          throw new ApiError(404, "Venue does not exist.");
        }

        if (!tournament) {
          throw new ApiError(404, "Tournament not found.");
        }

        const endTime = moment(schedule.matchTime, "hA")
          .add(tournament.matchOver * 4, "minutes")
          .format("hA");

        const venueConflict = await VenueBooking.exists({
          venueId: newVenueId,
          bookingDate: schedule.matchDate,
          $or: [
            {
              startTime: { $lte: schedule.matchTime },
              endTime: { $gt: schedule.matchTime },
            },
            { startTime: schedule.matchTime },
          ],
        }).session(session);

        if (venueConflict) {
          throw new ApiError(
            400,
            "Venue is already booked for this date and time."
          );
        }

        const bookingUpdated = await VenueBooking.updateOne(
          {
            venueId: schedule.venueId,
            bookingDate: schedule.matchDate,
            startTime: schedule.matchTime,
            endTime,
            bookedBy: author._id,
          },
          {
            $set: { venueId: newVenueId },
          },
          { session }
        );

        if (!bookingUpdated.matchedCount) {
          throw new ApiError(404, "Existing venue booking not found.");
        }

        updatePayload.venueId = newVenueId;
      }

      if (newRound) {
        updatePayload.round = newRound;
      }

      await Schedule.updateOne(
        { _id: scheduleId },
        { $set: updatePayload },
        { session }
      );
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, null, "Schedule details updated successfully.")
      );
  } finally {
    await session.endSession();
  }
});
