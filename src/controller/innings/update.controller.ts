import { Innings } from "../../models/matchModel/innings.model";
import { Match } from "../../models/matchModel/match.model";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const updateInnings = asyncHandler(async(req, res)=>{
    // authentication and authorization 
    const author = req.user;
    if (!author || !["admin", "staff"].includes(author.role)) {
      throw new ApiError(403, "Unauthorized! Only admin or staff can update innings.");
    }

     // Extract request data
  const { tournamentId, matchId, inningsId } = req.params;
  const { teamId, inningsNumber, wicket, runs, over, extras } = req.body;

  // Validate required fields
  if (!tournamentId || !matchId || !inningsId) {
    throw new ApiError(400, "Tournament, match, and innings ID are required.");
  }
  
  // Find required documents
  const [innings, match, tournament] = await Promise.all([
    Innings.findById(inningsId),
    Match.findById(matchId),
    Tournament.findById(tournamentId),
  ]);

  if (!innings) {
    throw new ApiError(404, "Innings not found.");
  }
  if (!match) {
    throw new ApiError(404, "Match not found.");
  }
  if (!tournament) {
    throw new ApiError(404, "Tournament not found.");
  }

  // Prevent updates if match is completed
  if (match.status === "completed") {
    throw new ApiError(400, "Cannot update innings for a completed match.");
  }

  // Ensure the team is part of the match
  if (![match.teamA?.toString(), match.teamB?.toString()].includes(teamId)) {
    throw new ApiError(400, "Invalid team. Team must be part of the match.");
  }

  // Ensure wickets do not exceed 10
  if (wicket > 10) {
    throw new ApiError(400, "Wickets cannot exceed 10.");
  }

  // Ensure overs do not exceed tournament over limit
  if (over > tournament.matchOver) {
    throw new ApiError(400, `Overs cannot exceed the tournament limit (${tournament.matchOver}).`);
  }

  // Validate non-negative values
  if (wicket < 0 || runs < 0 || extras.wide < 0 || extras.noBalls < 0 || extras.byes < 0) {
    throw new ApiError(400, "Runs, wickets, and extras cannot be negative.");
  }

  // Recalculate total extras & total runs
  const totalExtras = extras.wide + extras.noBalls + extras.byes;
  const totalRuns = runs + totalExtras;

  // Update innings
  innings.teamId = teamId;
  innings.inningsNumber = inningsNumber;
  innings.wicket = wicket;
  innings.runs = runs;
  innings.overs = over;
  innings.extras = { ...extras, totalExtras };
  innings.totalRuns = totalRuns;

  await innings.save();

  // Update match & schedule status if necessary
  if (match.status === "scheduled" && inningsNumber === 1) {
    await Promise.all([
      Match.findByIdAndUpdate(matchId, { status: "in-progress" }, { new: true }),
      Schedule.findOneAndUpdate({ matchId }, { status: "in-progress" }, { new: true }),
    ]);
  }

  // Response
  res.status(200).json(new ApiResponse(200, innings, "Innings updated successfully."));
  
});