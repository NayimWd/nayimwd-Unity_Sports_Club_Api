import { Router } from "express";
import { veryfyJWT } from "../../middleware/auth.middleware";
import { createSchedule, getSchedules, updateDetails, updateStatus, changeTeams, reSchedule } from "../../controller/schedule";


const router = Router();

// route types 
type Schedule = {
    create: "/create/:tournamentId",
    update_details: "/update_details/:tournamentId/:scheduleId",
    update_timing: "/update_timing/:tournamentId/:scheduleId",
    update_status: "/update_status/:tournamentId/:scheduleId",
    all: "/all/:tournamentId",
  
}

// endpoints
const ScheduleRoutes: Schedule = {
    create: "/create/:tournamentId",
    update_details: "/update_details/:tournamentId/:scheduleId",
    update_timing: "/update_timing/:tournamentId/:scheduleId",
    update_status: "/update_status/:tournamentId/:scheduleId",
    all: "/all/:tournamentId"
};

// create schedule
router.route(ScheduleRoutes.create).post(veryfyJWT, createSchedule);
// get all schedules
router.route(ScheduleRoutes.all).get(getSchedules);
// update schedule details
router.route(ScheduleRoutes.update_details).put(veryfyJWT, updateDetails);


export default router;