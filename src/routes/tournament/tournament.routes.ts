import { Router } from "express";
import { veryfyJWT } from "../../middleware/auth.middleware";
import { createTournament } from "../../controller/tournament/create.controller";
import { upload } from "../../middleware/multer.middleware";
import {
  getAllTournaments,
  getTournamentById,
  getTournamentsByStatus,
  updateTournamentDetails,
  updateTournamentPhoto,
  updateTournamentStatus,
  getTeamsOfTournament,
  updateDate,
  createTournamentResult,
  getLatestTournament,
  tournamentDetails
} from "../../controller/tournament";
import { getTournamentResult } from "../../controller/tournament/getTournamentResult.controller";

const router = Router();

// interface
type Tournament = {
  create: "/create";
  get_all: "/all";
  get_by_status: "/status";
  latest: "/latest";
  details: "/details/:tournamentId";
  update_details: "/update_details/:tournamentId";
  update_date: "/update_date/:tournamentId";
  update_photo: "/update_photo/:tournamentId";
  update_status: "/update_status/:tournamentId";
  getTeams: "/teams/:tournamentId";
  createResult: "/create_result/:tournamentId";
  getResults: "/results/:tournamentId";
  get_details: "/tournamentDetails/:tournamentId"
};

// routes
const tournament: Tournament = {
  create: "/create",
  get_all: "/all",
  latest: "/latest",
  get_by_status: "/status",
  details: "/details/:tournamentId",
  update_date: "/update_date/:tournamentId",
  update_details: "/update_details/:tournamentId",
  update_photo: "/update_photo/:tournamentId",
  update_status: "/update_status/:tournamentId",
  getTeams: "/teams/:tournamentId",
  createResult: "/create_result/:tournamentId",
  getResults: "/results/:tournamentId",
  get_details: "/tournamentDetails/:tournamentId",
};

// create tournament
router
  .route(tournament.create)
  .post(veryfyJWT, upload.single("photo"), createTournament);
// get all tournaments
router.route(tournament.get_all).get(getAllTournaments);
// get latest tournament
router.route(tournament.latest).get(getLatestTournament);
// get tournament by status
router.route(tournament.get_by_status).get(getTournamentsByStatus);
// get tournament by id
router.route(tournament.details).get(getTournamentById);
// get tournament by id
router.route(tournament.get_details).get(tournamentDetails);
// update tournament details
router
  .route(tournament.update_details)
  .patch(veryfyJWT, updateTournamentDetails);
// update date
router.route(tournament.update_date).patch(veryfyJWT, upload.none(), updateDate);
// update photo
router
  .route(tournament.update_photo)
  .patch(veryfyJWT, upload.single("photo"), updateTournamentPhoto);
// update status
router.route(tournament.update_status).patch(veryfyJWT, updateTournamentStatus);
// get tournament teams
router.route(tournament.getTeams).get(getTeamsOfTournament);
// create tournament result
router.route(tournament.createResult).post(veryfyJWT, createTournamentResult);
// get tournament results
router.route(tournament.getResults).get(getTournamentResult);
export default router;
