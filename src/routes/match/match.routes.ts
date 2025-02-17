import { Router } from "express";
import { veryfyJWT } from "../../middleware/auth.middleware";
import { createMatch, getAllMatch } from "../../controller/match";

const router = Router();

// route types
type Match = {
    create: "/create/:tournamentId",
    all: "/all/:tournamentId",
    delete: "/delete/:matchId",
    updateStatus: "/update_status/:matchId",
    updateTeams: "/update_teams/:matchId",
    updateUmpires: "/update_umpires/:matchId",
    updatePhoto: "/update_photo/:matchId",
    updateWinner: "/update_winner/:matchId",
};

// endpoints
const MatchRoutes: Match = {
    create: "/create/:tournamentId",
    all: "/all/:tournamentId",
    delete: "/delete/:matchId",
    updateStatus: "/update_status/:matchId",
    updateTeams: "/update_teams/:matchId",
    updateUmpires: "/update_umpires/:matchId",
    updatePhoto: "/update_photo/:matchId",
    updateWinner: "/update_winner/:matchId",
};


// create match
router.route(MatchRoutes.create).post(veryfyJWT, createMatch);
// get all matches
router.route(MatchRoutes.all).get(getAllMatch)

export default router;