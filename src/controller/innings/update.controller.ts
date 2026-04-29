import { Innings } from "../../models/matchModel/innings.model";
import { Match } from "../../models/matchModel/match.model";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const updateInnings = asyncHandler(async (req, res) => {
  // validating user
  const author = (req as any).user;

  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(
      403,
      "Unauthorized! Only admin or staff can update innings."
    );
  }
  // getting data
  const { tournamentId, matchId, inningsId } = req.params;
  const { teamId, inningsNumber, wicket, runs, over, extras } = req.body;

  if (!tournamentId || !matchId || !inningsId) {
    throw new ApiError(400, "Tournament, match, and innings ID are required.");
  }

  // -------------------------------
  // 1. get only required fields
  // -------------------------------
  const [match, tournament, innings] = await Promise.all([
    Match.findById(matchId).select("teamA teamB status").lean(),

    Tournament.findById(tournamentId).select("matchOver").lean(),

    Innings.findById(inningsId).select("teamId inningsNumber").lean(),
  ]);

  if (!innings) throw new ApiError(404, "Innings not found.");
  if (!match) throw new ApiError(404, "Match not found.");
  if (!tournament) throw new ApiError(404, "Tournament not found.");

  // -------------------------------
  // 2. Validation
  // -------------------------------
  // if match status completed can not update innings
  if (match.status === "completed") {
    throw new ApiError(400, "Cannot update innings for a completed match.");
  }
  // check team id belong to match
  const teamIds = [match.teamA?.toString(), match.teamB?.toString()];
  if (!teamIds.includes(teamId)) {
    throw new ApiError(400, "Invalid team. Team must be part of the match.");
  }
  // wicket validation
  if (wicket > 10) throw new ApiError(400, "Wickets cannot exceed 10.");

  // over validation
  if (over > tournament.matchOver) {
    throw new ApiError(
      400,
      `Overs cannot exceed the tournament limit (${tournament.matchOver}).`
    );
  }
  // prevent negative values
  if (
    wicket < 0 ||
    runs < 0 ||
    extras.wide < 0 ||
    extras.noBalls < 0 ||
    extras.byes < 0
  ) {
    throw new ApiError(400, "Runs, wickets, and extras cannot be negative.");
  }

  // -------------------------------
  // 3. compute derived values
  // -------------------------------
  const totalExtras = extras.wide + extras.noBalls + extras.byes;
  const totalRuns = runs + totalExtras;

  // -------------------------------
  // 4. update innings
  // -------------------------------
  const updatedInnings = await Innings.findOneAndUpdate(
    {
      _id: inningsId,
      matchId,
    },
    {
      $set: {
        teamId,
        inningsNumber,
        wicket,
        runs,
        overs: over,
        extras: { ...extras, totalExtras },
        totalRuns,
      },
    },
    { new: true }
  );

  if (!updatedInnings) {
    throw new ApiError(409, "Innings update failed due to concurrent change.");
  }

  // -------------------------------
  // 5. status update for match and schedule
  // -------------------------------
  if (match.status === "scheduled" && inningsNumber === 1) {
    await Promise.all([
      Match.updateOne(
        { _id: matchId, status: "scheduled" },
        { $set: { status: "in-progress" } }
      ),
      Schedule.updateOne(
        { matchId, status: "scheduled" },
        { $set: { status: "in-progress" } }
      ),
    ]);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedInnings, "Innings updated successfully.")
    );
});
