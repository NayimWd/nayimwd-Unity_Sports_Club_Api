import { Router } from "express";
import { veryfyJWT } from "../../middleware/auth.middleware";
import {
  createInnings,
  getMatchInnings,
  getTournamentInnings,
  updateInnings,
} from "../../controller/innings";

const router = Router();
// route types
type Innings = {
  create: "/create/:tournamentId/:matchId";
  update: "/update/:tournamentId/:matchId/:inningsId";
  delete: "/delete/:inningsId";
  all: "/all/:tournamentId";
  details: "/details/:matchId";
};

// endpoints
const innings_routes: Innings = {
  create: "/create/:tournamentId/:matchId",
  update: "/update/:tournamentId/:matchId/:inningsId",
  delete: "/delete/:inningsId",
  all: "/all/:tournamentId",
  details: "/details/:matchId",
};

// create Match
router.route(innings_routes.create).post(veryfyJWT, createInnings);
// get tournament Inningss
router.route(innings_routes.all).get(getTournamentInnings);
// get match innings
router.route(innings_routes.details).get(getMatchInnings);
router.route(innings_routes.update).patch(veryfyJWT, updateInnings);

export default router;
