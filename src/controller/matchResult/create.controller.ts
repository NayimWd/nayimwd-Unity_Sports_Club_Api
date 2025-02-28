import { Innings } from "../../models/matchModel/innings.model";
import { Match } from "../../models/matchModel/match.model";
import { MatchResult } from "../../models/matchModel/matchResult.model";
import { PointTable } from "../../models/point table/pointTables.model";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { Tournament } from "../../models/tournamentModel/tournaments.model";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";

export const createMatchResult = asyncHandler(async(req, res)=>{
    // Authentication
  const author = (req as any).user;
  if (!author || !["admin", "staff"].includes(author.role)) {
    throw new ApiError(403, "You are not authorized to create a match");
  }

  // extract data from req params and body 
  const {tournamentId, matchId} = req.params;
  const {manOfTheMatch, method = "normal", matchReport} = req.body;

  // validate data 
  if (!tournamentId || !matchId || !manOfTheMatch) {
    throw new ApiError(400, "Tournament ID, Match ID, and Man of the Match are required");
  }

  // fetch tournament and match data
  const [tournament, match] = await Promise.all([
    Tournament.findById(tournamentId),
    Match.findById(matchId)
  ])

  // validate 
  if(!tournament || !match){
    throw new ApiError(404, "Tournament or Match not found.");
  }

  // fetch innings for metch 
  const [innings1, innings2] = await Promise.all([
    Innings.findOne({matchId, inningsNumber: 1}),
    Innings.findOne({matchId, inningsNumber: 2})
  ]);

  if(!innings1 || !innings2){
    throw new ApiError(400, "Both innings must completed before creating a match result")
  }

  // select winnner and defeated team and margin
  let winner;
  let defeated;
  let margin;
  // select winner by most runs of match innings
  if(innings1.totalRuns > innings2.totalRuns){
    winner = innings1.teamId;
    defeated: innings2.teamId;
    margin: `${innings1.totalRuns} - ${innings2.totalRuns} runs`
  } else if(innings2.totalRuns > innings1.totalRuns){
    winner = innings2.teamId;
    defeated: innings1.teamId;
    margin: `${innings2.totalRuns - innings1.totalRuns} runs`;
  } else {
    winner = null;
    defeated = null;
    margin = "Match Tied"
  }

  // wicket margin calculation 
  if(winner){
    const winnerInnings = winner.equals(innings1.teamId) ? innings1 : innings2;
    const wicketMargin = 10 - winnerInnings.wicket;
    margin += ` and ${wicketMargin} wickets`
  }


  // validate man of the  match
  if(manOfTheMatch){
    if(![match.teamA?.toString(), match.teamB?.toString()].includes(manOfTheMatch)){
        throw new ApiError(400, "Man of the Match must belong to one of the playing teams.");
    }
  }

  // create result 
  const matchResult = await MatchResult.create({
    tournamentId,
    matchId,
    winner,
    defeated,
    margin,
    method: method || "normal",
    manOfTheMatch,
    matchReport,
    photo: null
  });

  if (!matchResult) {
    throw new ApiError(500, "Failed to create match result.");
  }

  // update match and schedule status 
  await Promise.all([
    Match.findByIdAndUpdate(matchId, {status: "completed"}),
    Schedule.findOneAndUpdate({matchId}, {status: "completed"})
  ]);

  // update point table 
  if(winner){
    await Promise.all([
        PointTable.findOneAndUpdate(
            {
                tournamentId, teamId: winner
            },
            {
                $inc: {wins: 1, matchPlayed: 1, points: 2},
            },
            {upsert: true, new: true}
        ),
        PointTable.findOneAndUpdate(
            {
                tournamentId, teamId: defeated
            },
            {
                $inc: {losses: 1, matchPlayed: 1},
            },
            {upsert: true, new: true}
        )
    ])
  } else {
    PointTable.findOneAndUpdate(
        {
            tournamentId, teamId: winner
        },
        {
            $inc: {ties: 1, matchPlayed: 1, points: 1},
        },
        {upsert: true, new: true}
    ),
    PointTable.findOneAndUpdate(
        {
            tournamentId, teamId: defeated
        },
        {
            $inc: {ties: 1, matchPlayed: 1, points: 1},
        },
        {upsert: true, new: true}
    )
  }

  // update future match
  

});