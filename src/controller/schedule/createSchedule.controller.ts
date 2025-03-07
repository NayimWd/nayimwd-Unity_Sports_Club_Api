import { Match } from "../../models/matchModel/match.model";
import { Registration } from "../../models/registrationModel/registrations.model";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { VenueBooking } from "../../models/venueModel/venueBooking.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const createSchedule = asyncHandler(async (req, res) => {
  // Authenticate user
  const author = (req as any).user;
  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to create a schedule");
  }

  // Extract data from request
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

  // Validate tournament
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new ApiError(404, "Tournament not found");
  }

  // Fetch Match and Schedule in a single query
  const [existingMatch, existingSchedule] = await Promise.all([
    Match.findOne({ tournamentId, matchNumber }),
    Schedule.findOne({ tournamentId, matchNumber }),
  ]);

  // Ensure match number validation based on round
  if (existingSchedule) {
    throw new ApiError(
      400,
      `Match ${matchNumber} is already scheduled for this tournament`
    );
  }

  if (round === "round 1" && existingMatch) {
    throw new ApiError(
      400,
      `Match ${matchNumber} already exists in this tournament.`
    );
  } else if (round !== "round 1" && !existingMatch) {
    throw new ApiError(
      400,
      `Match ${matchNumber} not yet created in this tournament.`
    );
  }
  // Ensure venue is available for booking
  const venueConflict = await VenueBooking.findOne({
    venueId,
    matchDate,
    matchTime,
  });
  if (venueConflict) {
    throw new ApiError(400, "Venue is already booked at this date and time");
  }

  // Determine teams based on round
  let matchData: any = {
    tournamentId,
    matchNumber,
    status: "upcoming",
    teamA: null,
    teamB: null,
    previousMatches: { matchA: null, matchB: null },
    umpires: { firstUmpire: null, secondUmpire: null, thirdUmpire: null },
    photo: null,
  };

  //  First Round: Validate Teams**
  if (round === "round 1") {
    if (!teamA || !teamB) {
      throw new ApiError(
        400,
        "TeamA and TeamB are required for round 1 matches"
      );
    }

    // Check if both teams are registered and approved
    const registeredTeams = await Registration.find({
      tournamentId,
      teamId: { $in: [teamA, teamB] },
      status: "approved",
    });

    if (registeredTeams.length !== 2) {
      throw new ApiError(
        400,
        "One or both teams are not registered or approved for this tournament."
      );
    }

    matchData.teamA = teamA;
    matchData.teamB = teamB;
  }

  // Later Rounds: Validate Previous Matches**
  if (round !== "round 1") {
    if (matchId && !(await Match.findById(matchId))) {
      throw new ApiError(404, "Provided matchId does not exist");
    }
    if (
      !previousMatches ||
      !previousMatches.matchA ||
      !previousMatches.matchB
    ) {
      throw new ApiError(
        400,
        "Previous match references are required for later rounds"
      );
    }

    const matchA = await Match.findById(previousMatches.matchA);
    const matchB = await Match.findById(previousMatches.matchB);
    if (!matchA || !matchB) {
      throw new ApiError(404, "One or both previous matches not found");
    }

    matchData.previousMatches = { matchA: matchA._id, matchB: matchB._id };
  }

  // Create the Match First
  let newMatch;
  if (round === "round 1") {
    newMatch = await Match.create(matchData);

    if (!newMatch) {
      throw new ApiError(500, "Failed to create the match");
    }
  }

  // Create Schedule with the matchId
  const newSchedule = await Schedule.create({
    tournamentId,
    matchId: matchId ? matchId : newMatch?._id,
    matchNumber,
    round,
    venueId,
    matchDate,
    matchTime,
    teams: { teamA: matchData.teamA, teamB: matchData.teamB },
    previousMatches: matchData.previousMatches,
    status: "scheduled",
  });

  // Book the Venue
  if (newSchedule) {
    // Book the venue
    const venueBooking = await VenueBooking.create({
      venueId,
      bookedBy: author._id,
      bookingDate: matchDate,
      startTime: matchTime,
      endTime,
    });

    if (!venueBooking) {
      throw new ApiError(500, "Failed to book the venue");
    }
  }

  res
    .status(201)
    .json(new ApiResponse(201, newSchedule, "Schedule created successfully"));
});
