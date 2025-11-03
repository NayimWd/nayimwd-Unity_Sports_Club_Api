import { Innings } from "../../models/matchModel/innings.model";
import { Match } from "../../models/matchModel/match.model";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const createInnings = asyncHandler(async (req, res) => {
  // authentication and authorization
  const author = (req as any).user;
  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(
      403,
      "Invalid Token, You are not authorized to create innings"
    );
  }

  // extract data from req params and body
  const { tournamentId, matchId } = req.params;
  const { teamId, inningsNumber, wicket, runs, over, extras } = req.body;

  // validate data
  if (
    !tournamentId ||
    !matchId ||
    !teamId ||
    !inningsNumber ||
    !wicket ||
    !runs ||
    !over ||
    !extras
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // vallidate if tournament, match and  existsing innings
  const [match, tournament, existingInnings] = await Promise.all([
    Match.findById(matchId),
    Tournament.findById(tournamentId),
    Innings.findOne({ matchId, inningsNumber }),
  ]);

  if (!match || !tournament) {
    throw new ApiError(404, "Tournament or match not found");
  }

  // ensure team is belongs to the match
  if (![match.teamA?.toString(), match.teamB?.toString()].includes(teamId)) {
    throw new ApiError(400, "Invalid team, Team must be part of the match");
  }

  // Ensure only two Innings Exists for a match
  const inningsCount = await Innings.countDocuments({ matchId });
  if (inningsCount >= 2) {
    throw new ApiError(400, "A match cannot have more than two innings.");
  }

  // prevent duplicate innings
  if (existingInnings) {
    throw new ApiError(
      400,
      `Innings ${inningsNumber} is already exists for this match`
    );
  }

  // Ensure team is not repeated for the second innings
  if (inningsNumber === 2) {
    const firstInnings = await Innings.findOne({ matchId, inningsNumber: 1 });
    if (firstInnings && firstInnings.teamId.toString() === teamId) {
      throw new ApiError(
        400,
        "The same team cannot play both the first and second innings."
      );
    }
  }

  // ensure wicket do not exceed 10
  if (wicket > 10) {
    throw new ApiError(400, `wicket can not exceed over 10 wicket`);
  }

  // ensure over do not exceed tournament over
  if (over > tournament.matchOver) {
    throw new ApiError(
      400,
      `Over can not exceed tournament limit ${tournament.matchOver}`
    );
  }

  //  Validate Score Constraints
  if (
    wicket < 0 ||
    runs < 0 ||
    extras.wide < 0 ||
    extras.noBalls < 0 ||
    extras.byes < 0
  ) {
    throw new ApiError(400, "Runs, wickets, and extras cannot be negative.");
  }
  // calculate total extra and total runs
  const totalExtras = extras.wide + extras.noBalls + extras.byes;
  const totalRuns = runs + totalExtras;

  // create innings
  const newInnings = await Innings.create({
    tournamentId: tournamentId,
    matchId,
    teamId,
    inningsNumber: inningsNumber,
    extras: {
      wide: extras.wide,
      noBalls: extras.noBalls,
      byes: extras.byes,
      totalExtras: totalExtras,
    },
    wicket: wicket,
    overs: over,
    runs: runs,
    totalRuns: totalRuns,
  });

  if (!newInnings) {
    throw new ApiError(500, "Failed to create innings.");
  }

  // update schedule and match status
  if (newInnings || inningsNumber === 1) {
    await Promise.all([
      Match.findByIdAndUpdate(
        matchId,
        {
          status: "in-progress",
        },
        {
          new: true,
        }
      ),
      Schedule.findOneAndUpdate(
        { matchId },
        {
          status: "in-progress",
        },
        {
          new: true,
        }
      ),
    ]);
  }

  // return response
  res
    .status(201)
    .json(new ApiResponse(201, newInnings, "Innings created successfully."));
});
