import { Router } from "express";
import { veryfyJWT } from "../../middleware/auth.middleware";
import {
  applicationDetails,
  applyForTournament,
  getTournamentApplication,
  myApplication,
  reApplyForTournament,
  updateStatus,
  withdrawApplication,
} from "../../controller/registration";
import { getPendingRegistration } from "../../controller/registration/getApplications.controller";

const router = Router();

type Registration = {
  apply: "/apply/:tournamentId";
  update_status: "/update_status/:tournamentId";
  withdraw: "/withdraw/:tournamentId";
  reApply: "/reApply/:tournamentId";
  get_all: "/get_all/:tournamentId";
  pending: "/pending/:tournamentId";
  myApplication: "/application/:tournamentId";
  details: "/application/details/:applicationId"
}

const registrationRoutes: Registration = {
  apply: "/apply/:tournamentId",
  update_status: "/update_status/:tournamentId",
  withdraw: "/withdraw/:tournamentId",
  reApply: "/reApply/:tournamentId",
  get_all: "/get_all/:tournamentId",
  pending: "/pending/:tournamentId",
  myApplication: "/application/:tournamentId",
  details: "/application/details/:applicationId"
};

// routes
// apply for tournament
router.route(registrationRoutes.apply).post(veryfyJWT, applyForTournament);
// update status
router.route(registrationRoutes.update_status).patch(veryfyJWT, updateStatus);
// withdraw application
router.route(registrationRoutes.withdraw).patch(veryfyJWT, withdrawApplication);
// re registration
router.route(registrationRoutes.reApply).patch(veryfyJWT, reApplyForTournament);
// get all application by tournament
router
  .route(registrationRoutes.get_all)
  .get(veryfyJWT, getTournamentApplication);
// get pending registration
router.route(registrationRoutes.pending).get(veryfyJWT, getPendingRegistration);
// get my application 
router.route(registrationRoutes.myApplication).get(veryfyJWT, myApplication);
router.route(registrationRoutes.details).get(veryfyJWT, applicationDetails)


export default router;
