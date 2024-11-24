import { Router } from "express";
import { isManager, veryfyJWT } from "../../middleware/auth.middleware";
import { upload } from "../../middleware/multer.middleware";
import { createTeam, updateTeamLogo, updateTeamName } from "../../controller/team";

const router = Router();

interface ITeamRoutes {
    create: "/create",
    updateName: "/update_name/:teamId",
    updateLogo: "/update_logo/:teamId",
}

const teamRoutes : ITeamRoutes = {
    create: "/create",
    updateName: "/update_name/:teamId",
    updateLogo: "/update_logo/:teamId",
}

// create team
router.route(teamRoutes.create).post(veryfyJWT, upload.single("logo"), createTeam);
// update team name
router.route(teamRoutes.updateName).put(veryfyJWT, isManager, updateTeamName);
// update team logo
router.route(teamRoutes.updateLogo).put(veryfyJWT, isManager, upload.single("logo"), updateTeamLogo)

export default router;