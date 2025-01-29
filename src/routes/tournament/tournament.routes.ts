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
} from "../../controller/tournament";

const router = Router();

// interface
interface ITournament {
  create: "/create";
  get_all: "/all";
  get_by_status: "/status";
  details: "/details/:tournameId";
  update_details: "/update_details/:tournamentId";
  update_photo: "/update_photo/:tournamentId";
  update_status: "/update_status/:tournamentId";
}

// routes
const tournament: ITournament = {
  create: "/create",
  get_all: "/all",
  get_by_status: "/status",
  details: "/details/:tournameId",
  update_details: "/update_details/:tournamentId",
  update_photo: "/update_photo/:tournamentId",
  update_status: "/update_status/:tournamentId",
};

// create tournament
router
  .route(tournament.create)
  .post(veryfyJWT, upload.single("photo"), createTournament);
// get all tournaments
router.route(tournament.get_all).get(getAllTournaments);
// get tournament by status
router.route(tournament.get_by_status).get(getTournamentsByStatus);
// get tournament by id
router.route(tournament.details).get(getTournamentById);
// update tournament details
router.route(tournament.update_details).patch(veryfyJWT, updateTournamentDetails);
// update photo
router
  .route(tournament.update_photo)
  .patch(veryfyJWT, upload.single("photo"), updateTournamentPhoto);
// update status
router.route(tournament.update_status).patch(veryfyJWT, updateTournamentStatus);

export default router;
