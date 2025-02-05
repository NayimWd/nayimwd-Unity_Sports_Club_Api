import { Router } from "express";
import { veryfyJWT } from "../../middleware/auth.middleware";
import { createSchedule } from "../../controller/schedule";

const router = Router();

// route types 
type Schedule = {
    create: "/create/:tournamentId",
    update_details: "/update_details/:tournamentId",
    update_timing: "/update_timing/:tournamentId",
    update_status: "/update_status/:tournamentId",
    delete: "/delete/:tournamentId",
    all: "/all/:tournamentId",
    details: "/:tournamentId/:id"
}

// endpoints
const ScheduleRoutes: Schedule = {
    create: "/create/:tournamentId",
    update_details: "/update_details/:tournamentId",
    update_timing: "/update_timing/:tournamentId",
    update_status: "/update_status/:tournamentId",
    delete: "/delete/:tournamentId",
    all: "/all/:tournamentId",
    details: "/:tournamentId/:id"
};

// create schedule
router.route(ScheduleRoutes.create).post(veryfyJWT, createSchedule)


export default router;