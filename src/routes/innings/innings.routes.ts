import { Router } from "express";
import { veryfyJWT } from "../../middleware/auth.middleware";
import { createInnings } from "../../controller/innings";

const router = Router();
// route types
type Innings = {
    create: "/create/:tournamentId",
    update: "/update/:matchId/inningsId",
    delete: "/delete/:inningsId"
    all: "/all/:tournamentId",
    details: "/details/:matchId"
}

// endpoints
const innings_routes: Innings = {
    create: "/create/:tournamentId",
    update: "/update/:matchId/inningsId",
    delete: "/delete/:inningsId",
    all: "/all/:tournamentId",
    details: "/details/:matchId"
}

// create Match 
router.route(innings_routes.create).post(veryfyJWT, createInnings)


export default router;