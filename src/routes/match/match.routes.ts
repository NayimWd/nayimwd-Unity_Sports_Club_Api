import { Router } from "express";
import { veryfyJWT } from "../../middleware/auth.middleware";
import {
  createMatch,
  deleteMatch,
  getAllMatch,
  matchDetails,
  updateMatchStatus,
  updateUmpire,
  addPlayingSquad,
  updatePlayingSquad,
  getPlayingSquad,
  getMatchTeams,
  getMatchOverview,
  getMatchUmpire,
} from "../../controller/match";
import {
  createMatchResult,
  getMatchResult,
} from "../../controller/matchResult";

const router = Router();

// route types
type Match = {
  create: "/create/:tournamentId";
  all: "/all/:tournamentId";
  details: "/details/:matchId";
  delete: "/delete/:matchId";
  updateStatus: "/update_status/:tournamentId/:matchId";
  updateUmpires: "/update_umpires/:tournamentId/:matchId";
  createSquad: "/createSquad/:tournamentId/:matchId";
  updateSquad: "/updateSquad/:tournamentId/:matchId/:teamId";
  getSquad: "/getSquad/:tournamentId/:matchId/:teamId";
  createResult: "/createResult/:tournamentId/:matchId";
  matchResult: "/matchResult/:matchId";
  teamOfMatch: "/teamsOfMatch/:matchId";
  matchOverview: "/overview/:tournamentId";
  matchUmpire: "/umpires/:matchId";
};

// endpoints
const MatchRoutes: Match = {
  create: "/create/:tournamentId",
  all: "/all/:tournamentId",
  details: "/details/:matchId",
  delete: "/delete/:matchId",
  updateStatus: "/update_status/:tournamentId/:matchId",
  updateUmpires: "/update_umpires/:tournamentId/:matchId",
  createSquad: "/createSquad/:tournamentId/:matchId",
  updateSquad: "/updateSquad/:tournamentId/:matchId/:teamId",
  getSquad: "/getSquad/:tournamentId/:matchId/:teamId",
  createResult: "/createResult/:tournamentId/:matchId",
  matchResult: "/matchResult/:matchId",
  teamOfMatch: "/teamsOfMatch/:matchId",
  matchOverview: "/overview/:tournamentId",
  matchUmpire: "/umpires/:matchId"
};

// create match
router.route(MatchRoutes.create).post(veryfyJWT, createMatch);
// get all matches
router.route(MatchRoutes.all).get(getAllMatch);
// get match details
router.route(MatchRoutes.details).get(matchDetails);
// update match status
router.route(MatchRoutes.updateStatus).patch(veryfyJWT, updateMatchStatus);
// update umpires
router.route(MatchRoutes.updateUmpires).patch(veryfyJWT, updateUmpire);
// delete match
router.route(MatchRoutes.delete).delete(veryfyJWT, deleteMatch);
// create squad
router.route(MatchRoutes.createSquad).post(veryfyJWT, addPlayingSquad);
// update squad
router.route(MatchRoutes.updateSquad).patch(veryfyJWT, updatePlayingSquad);
// get squad
router.route(MatchRoutes.getSquad).get(getPlayingSquad);
// create match result
router.route(MatchRoutes.createResult).post(veryfyJWT, createMatchResult);
// get match result
router.route(MatchRoutes.matchResult).get(getMatchResult);
// get match teams
router.route(MatchRoutes.teamOfMatch).get(getMatchTeams);
// get match overview
router.route(MatchRoutes.matchOverview).get(getMatchOverview);
// get match umpire
router.route(MatchRoutes.matchUmpire).get(getMatchUmpire);

export default router;
