import { Router } from "express";
import { veryfyJWT } from "../../middleware/auth.middleware";
import {
  applyForTournament,
  getTournamentApplication,
  reApplyForTournament,
  updateStatus,
  withdrawApplication,
} from "../../controller/registration";

const router = Router();

interface IRegistration {
  apply: "/apply/:tournamentId";
  update_status: "/update_status/:tournamentId";
  withdraw: "/withdraw/:tournamentId";
  reApply: "/reApply/:tournamentId";
  get_all: "/get_all/:tournamentId";
}

const registrationRoutes: IRegistration = {
  apply: "/apply/:tournamentId",
  update_status: "/update_status/:tournamentId",
  withdraw: "/withdraw/:tournamentId",
  reApply: "/reApply/:tournamentId",
  get_all: "/get_all/:tournamentId",
};

// routes
// apply for tournament
router.route(registrationRoutes.apply).post(veryfyJWT, applyForTournament);
// update status
router.route(registrationRoutes.update_status).put(veryfyJWT, updateStatus);
// withdraw application
router.route(registrationRoutes.withdraw).put(veryfyJWT, withdrawApplication);
// re registration
router.route(registrationRoutes.reApply).put(veryfyJWT, reApplyForTournament);
// get all application by tournament
router
  .route(registrationRoutes.get_all)
  .get(veryfyJWT, getTournamentApplication);

export default router;
