import { Router } from "express";
import { isAdmin, isManager, veryfyJWT } from "../../middleware/auth.middleware";
import { createMatch, deleteMatch, getAllMatch, matchDetails, updateMatchStatus, updateUmpire } from "../../controller/match";
import { addPlayingSquad } from "../../controller/match/addPlayingSquad.controller";
import { updatePlayingSquad } from "../../controller/match/updatePlayingSquad.controller";
import { getPlayingSquad } from "../../controller/match/getPlayinSquad.controller";

const router = Router();

// route types
type Match = {
    create: "/create/:tournamentId",
    all: "/all/:tournamentId",
    details: "/details/:tournamentId/:matchId",
    delete: "/delete/:matchId",
    updateStatus: "/update_status/:tournamentId/:matchId",
    updateUmpires: "/update_umpires/:tournamentId/:matchId",
    createSquad: "/createSquad/:tournamentId/:matchId",
    updateSquad: "/updateSquad/:tournamentId/:matchId/:teamId",
    getSquad: "/getSquad/:tournamentId/:matchId/:teamId"
};

// endpoints
const MatchRoutes: Match = {
    create: "/create/:tournamentId",
    all: "/all/:tournamentId",
    details: "/details/:tournamentId/:matchId",
    delete: "/delete/:matchId",
    updateStatus: "/update_status/:tournamentId/:matchId",
    updateUmpires: "/update_umpires/:tournamentId/:matchId",
    createSquad: "/createSquad/:tournamentId/:matchId",
    updateSquad: "/updateSquad/:tournamentId/:matchId/:teamId",
    getSquad: "/getSquad/:tournamentId/:matchId/:teamId"
};


// create match
router.route(MatchRoutes.create).post(veryfyJWT, createMatch);
// get all matches
router.route(MatchRoutes.all).get(getAllMatch)
// get match details
router.route(MatchRoutes.details).get(matchDetails);
// update match status
router.route(MatchRoutes.updateStatus).patch(veryfyJWT, updateMatchStatus);
// update umpires 
router.route(MatchRoutes.updateUmpires).patch(veryfyJWT, updateUmpire);
// delete match
router.route(MatchRoutes.delete).delete(veryfyJWT, deleteMatch);
// create squad
router.route(MatchRoutes.createSquad).post(veryfyJWT, isManager, addPlayingSquad);
// update squad
router.route(MatchRoutes.updateSquad).patch(veryfyJWT, isAdmin, updatePlayingSquad);
// get squad
router.route(MatchRoutes.getSquad).get(getPlayingSquad)

export default router;