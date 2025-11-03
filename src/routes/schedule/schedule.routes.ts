import { Router } from "express";
import { veryfyJWT } from "../../middleware/auth.middleware";
import {
  createSchedule,
  getSchedules,
  updateDetails,
  updateStatus,
  changeTeams,
  reSchedule,
  deleteSchedule,
} from "../../controller/schedule";

const router = Router();

// route types
type Schedule = {
  create: "/create/:tournamentId";
  update_details: "/update_details/:scheduleId";
  update_timing: "/update_timing/:scheduleId";
  update_status: "/update_status/:scheduleId";
  change_teams: "/change_teams/:scheduleId";
  all: "/all/:tournamentId";
  delete: "/delete/:scheduleId";
};

// endpoints
const ScheduleRoutes: Schedule = {
  create: "/create/:tournamentId",
  update_details: "/update_details/:scheduleId",
  update_timing: "/update_timing/:scheduleId",
  update_status: "/update_status/:scheduleId",
  change_teams: "/change_teams/:scheduleId",
  all: "/all/:tournamentId",
  delete: "/delete/:scheduleId",
};

// create schedule
router.route(ScheduleRoutes.create).post(veryfyJWT, createSchedule);
// get all schedules
router.route(ScheduleRoutes.all).get(getSchedules);
// update schedule details
router.route(ScheduleRoutes.update_details).patch(veryfyJWT, updateDetails);
// update schedule timing
router.route(ScheduleRoutes.update_timing).patch(veryfyJWT, reSchedule);
// update schedule status
router.route(ScheduleRoutes.update_status).patch(veryfyJWT, updateStatus);
// change teams
router.route(ScheduleRoutes.change_teams).patch(veryfyJWT, changeTeams);
// delete schedule
router.route(ScheduleRoutes.delete).delete(veryfyJWT, deleteSchedule);

export default router;
