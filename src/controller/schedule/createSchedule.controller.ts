import { Match } from "../../models/matchModel/match.model";
import { Registration } from "../../models/registrationModel/registrations.model";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { VenueBooking } from "../../models/venueModel/venueBooking.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import mongoose from "mongoose";

export const createSchedule = asyncHandler(async (req, res) => {
  // verify author
  const author = (req as any).user;

  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to create a schedule");
  }

  const { tournamentId } = req.params;
  const {
    matchId,
    matchNumber,
    round,
    venueId,
    matchDate,
    matchTime,
    endTime,
    teamA,
    teamB,
    previousMatches,
  } = req.body;

  if (
    !tournamentId ||
    !matchNumber ||
    !round ||
    !venueId ||
    !matchDate ||
    !matchTime
  ) {
    throw new ApiError(400, "Missing required fields");
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // check required existance and validate
      const [tournamentExists, existingMatch, existingSchedule, venueConflict] =
        await Promise.all([
          Tournament.exists({ _id: tournamentId }).session(session),
          Match.exists({ tournamentId, matchNumber }).session(session),
          Schedule.exists({ tournamentId, matchNumber }).session(session),
          VenueBooking.exists({
            venueId,
            bookingDate: matchDate,
            startTime: matchTime,
          }).session(session),
        ]);

      if (!tournamentExists) {
        throw new ApiError(404, "Tournament not found");
      }

      if (existingSchedule) {
        throw new ApiError(
          400,
          `Match ${matchNumber} is already scheduled for this tournament`
        );
      }

      if (venueConflict) {
        throw new ApiError(
          400,
          "Venue is already booked for this date and time."
        );
      }

      if (round === "round 1" && existingMatch) {
        throw new ApiError(
          400,
          `Match ${matchNumber} already exists in this tournament.`
        );
      }

      if (round !== "round 1" && !existingMatch) {
        throw new ApiError(
          400,
          `Match ${matchNumber} not yet created in this tournament.`
        );
      }

      const isRoundOne = round === "round 1";

      const matchPayload: any = {
        tournamentId,
        matchNumber,
        teamA: null,
        teamB: null,
        previousMatches: { matchA: null, matchB: null },
        umpires: {
          firstUmpire: null,
          secondUmpire: null,
          thirdUmpire: null,
        },
        photo: null,
      };

      let finalMatchId = matchId;

      if (isRoundOne) {
        if (!teamA || !teamB) {
          throw new ApiError(
            400,
            "TeamA and TeamB are required for round 1 matches"
          );
        }

        const approvedCount = await Registration.countDocuments({
          tournamentId,
          teamId: { $in: [teamA, teamB] },
          status: "approved",
        }).session(session);

        if (approvedCount !== 2) {
          throw new ApiError(
            400,
            "One or both teams are not registered or approved for this tournament."
          );
        }

        matchPayload.teamA = teamA;
        matchPayload.teamB = teamB;

        const [createdMatch] = await Match.create([matchPayload], { session });
        finalMatchId = createdMatch._id;
      } else {
        if (matchId) {
          const providedMatchExists = await Match.exists({
            _id: matchId,
          }).session(session);

          if (!providedMatchExists) {
            throw new ApiError(404, "Provided matchId does not exist");
          }
        }

        if (!previousMatches?.matchA || !previousMatches?.matchB) {
          throw new ApiError(
            400,
            "Previous match references are required for later rounds"
          );
        }

        const [matchAExists, matchBExists] = await Promise.all([
          Match.exists({ _id: previousMatches.matchA }).session(session),
          Match.exists({ _id: previousMatches.matchB }).session(session),
        ]);

        if (!matchAExists || !matchBExists) {
          throw new ApiError(404, "One or both previous matches not found");
        }

        matchPayload.previousMatches = {
          matchA: previousMatches.matchA,
          matchB: previousMatches.matchB,
        };
      }

      await Schedule.create(
        [
          {
            tournamentId,
            matchId: finalMatchId,
            matchNumber,
            round,
            venueId,
            matchDate,
            matchTime,
            teams: {
              teamA: matchPayload.teamA,
              teamB: matchPayload.teamB,
            },
            previousMatches: matchPayload.previousMatches,
            status: "scheduled",
          },
        ],
        { session }
      );

      await VenueBooking.create(
        [
          {
            venueId,
            bookedBy: author._id,
            bookingDate: matchDate,
            startTime: matchTime,
            endTime,
          },
        ],
        { session }
      );

      if (matchNumber === 1) {
        await Tournament.updateOne(
          { _id: tournamentId, status: { $ne: "ongoing" } },
          { $set: { status: "ongoing" } },
          { session }
        );
      }
    });

    return res
      .status(201)
      .json(new ApiResponse(201, null, "Schedule created successfully"));
  } finally {
    await session.endSession();
  }
});
