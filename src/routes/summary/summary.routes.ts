import { Router } from "express";
import { GetSummary } from "../../controller/dashboard/summary.controller";
import { getLetestTournamentResult } from "../../controller/dashboard/GetLatestResult.controller";

const router = Router();

type TSummaryType = {
  getSummary: "/summary";
  latestResult: "/latestResult";
};

const summary: TSummaryType = {
  getSummary: "/summary",
  latestResult: "/latestResult",
};

// get summary
router.route(summary.getSummary).get(GetSummary);
router.route(summary.latestResult).get(getLetestTournamentResult);

export default router;
