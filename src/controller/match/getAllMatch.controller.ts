import { info } from "console";
import { Innings } from "../../models/matchModel/innings.model";
import { Match } from "../../models/matchModel/match.model";
import { MatchResult } from "../../models/matchModel/matchResult.model";
import { Schedule } from "../../models/sceduleModel/schedules.model";
import { Team } from "../../models/teamModel/teams.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const getAllMatch = asyncHandler(async (req, res) => {
  // extract parameters
  const { tournamentId } = req.params;
  const { status } = req.query;

  // validate inputs
  if (!tournamentId) {
    throw new ApiError(400, "Please provide tournament ID");
  }

  // build search filter
  const filter: any = { tournamentId };

  // filter by status if provided
  const validateStatus = [
    "upcoming",
    "scheduled",
    "rescheduled",
    "in-progress",
    "completed",
    "cancelled",
  ];
  if (status && validateStatus.includes(status as string)) {
    filter.status = status;
  }

  // fetch matches
  const matches = await Match.find(filter)
    .select("-umpires")
    .populate("teamA", "teamName teamLogo")
    .populate("teamB", "teamName teamLogo")
    .lean();

  if (!matches.length) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { total: 0, match: [] },
          "Matches fetched successfully"
        )
      );
  }

  // get match ids
  const matchIds = matches.map((m) => m._id);

  // fetch data related innings, match and schedule
  const [inningsList, matchResults, schedules] = await Promise.all([
    Innings.find({
      matchId: { $in: matchIds },
    })
      .select("matchId inningsNumber totalRuns wicket teamId")
      .lean(),

    MatchResult.find({
      matchId: { $in: matchIds },
    })
      .populate("winner", "teamName")
      .select("matchId margin matchReport winner")
      .lean(),

    Schedule.find({
      matchId: { $in: matchIds },
    })
      .select("matchId matchDate matchTime")
      .lean(),
  ]);

  // 3. index data for fast lookup (O(1))
  const inningsMap = new Map<string, any[]>();
  for (const inn of inningsList) {
    const id = inn.matchId.toString();
    if (!inningsMap.has(id)) inningsMap.set(id, []);
    inningsMap.get(id)!.push(inn);
  }

  const resultMap = new Map(
    matchResults.map((r: any) => [r.matchId.toString(), r])
  );

  const scheduleMap = new Map(
    schedules.map((s: any) => [s.matchId.toString(), s])
  );

  // 4. enrich in memory (no DB calls inside loop)
  const enrichedMatches = matches.map((match: any) => {
    const id = match._id.toString();

    const innings = inningsMap.get(id) || [];
    const innings1 = innings.find((i) => i.inningsNumber === 1);
    const innings2 = innings.find((i) => i.inningsNumber === 2);

    const matchResult = resultMap.get(id);
    const schedule = scheduleMap.get(id);

    let matchSummary;

    if (matchResult) {
      matchSummary = {
        teamA_stats: `${match.teamA.teamName} ${innings1?.totalRuns || 0}-${innings1?.wicket || 0}`,
        teamB_stats: `${match.teamB.teamName} ${innings2?.totalRuns || 0}-${innings2?.wicket || 0}`,
        margin: matchResult.margin,
        report: matchResult.matchReport,
        winner: matchResult.winner,
      };
    } else {
      matchSummary = {
        matchDate: schedule?.matchDate || "TBD",
        matchTime: schedule?.matchTime || "TBD",
      };
    }

    return {
      ...match,
      matchSummary,
    };
  });

  // return response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total: matches.length,
        match: enrichedMatches,
      },
      "Matches fetched successfully"
    )
  );
});
