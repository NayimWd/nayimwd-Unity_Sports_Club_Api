import { Router } from "express";
import { veryfyJWT } from "../../middleware/auth.middleware";
import { createMatch, getAllMatch, matchDetails, updateMatchStatus, updateUmpire } from "../../controller/match";

const router = Router();

// route types
type Match = {
    create: "/create/:tournamentId",
    all: "/all/:tournamentId",
    details: "/details/:tournamentId/:matchId",
    delete: "/delete/:matchId",
    updateStatus: "/update_status/:tournamentId/:matchId",
    updateTeams: "/update_teams/:matchId",
    updateUmpires: "/update_umpires/:tournamentId/:matchId",
    updateWinner: "/update_winner/:matchId",
};

// endpoints
const MatchRoutes: Match = {
    create: "/create/:tournamentId",
    all: "/all/:tournamentId",
    details: "/details/:tournamentId/:matchId",
    delete: "/delete/:matchId",
    updateStatus: "/update_status/:tournamentId/:matchId",
    updateTeams: "/update_teams/:matchId",
    updateUmpires: "/update_umpires/:tournamentId/:matchId",
    updateWinner: "/update_winner/:matchId",
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

export default router;