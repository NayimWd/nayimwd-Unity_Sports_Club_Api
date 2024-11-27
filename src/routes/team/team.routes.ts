import { Router } from "express";
import { isAdmin, isManager, veryfyJWT } from "../../middleware/auth.middleware";
import { upload } from "../../middleware/multer.middleware";
import { createTeam, deleteTeam, getAllTeams, getMyteam, getTeamDetails, updateTeamLogo, updateTeamName } from "../../controller/team";

const router = Router();

interface ITeamRoutes {
    create: "/create",
    updateName: "/update_name/:teamId",
    updateLogo: "/update_logo/:teamId",
    all_teams: "/all_teams",
    details: "/details/:teamId",
    my_team: "/my_team",
    delete:"/delete/:teamId",
}

const teamRoutes : ITeamRoutes = {
    create: "/create",
    updateName: "/update_name/:teamId",
    updateLogo: "/update_logo/:teamId",
    all_teams: "/all_teams",
    details: "/details/:teamId",
    my_team: "/my_team",
    delete: "/delete/:teamId"
}

// create team
router.route(teamRoutes.create).post(veryfyJWT, upload.single("logo"), createTeam);
// update team name
router.route(teamRoutes.updateName).put(veryfyJWT, isManager, updateTeamName);
// update team logo
router.route(teamRoutes.updateLogo).put(veryfyJWT, isManager, upload.single("logo"), updateTeamLogo)
// get all teams 
router.route(teamRoutes.all_teams).get(getAllTeams);
// get team details
router.route(teamRoutes.details).get(getTeamDetails);
// get my team 
router.route(teamRoutes.my_team).get(veryfyJWT, isManager, getMyteam);
// delete team
router.route(teamRoutes.delete).delete(veryfyJWT, isManager, deleteTeam);

export default router;