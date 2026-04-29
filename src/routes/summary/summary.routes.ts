import { Router } from "express";
import { GetSummary } from "../../controller/dashboard/summary.controller";
import { getLetestTournamentResult } from "../../controller/dashboard/GetLatestResult.controller";
import { veryfyJWT } from "../../middleware/auth.middleware";
import { umpireSummary } from "../../controller/dashboard/UmpireSummary.controller";

const router = Router();

type TSummaryType = {
  getSummary: "/summary";
  latestResult: "/latestResult";
  umpireSummary: "/umpire_summary";
};

const summary: TSummaryType = {
  getSummary: "/summary",
  latestResult: "/latestResult",
  umpireSummary: "/umpire_summary"
};

// get summary
router.route(summary.getSummary).get(GetSummary);
router.route(summary.latestResult).get(getLetestTournamentResult);
router.route(summary.umpireSummary).get(veryfyJWT, umpireSummary);

export default router;
