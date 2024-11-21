import { Router } from "express";
import { veryfyJWT } from "../../middleware/auth.middleware";
import { upload } from "../../middleware/multer.middleware";
import { createTeam } from "../../controller/team";

const router = Router();

interface ITeamRoutes {
    create: "/create"
}

const teamRoutes : ITeamRoutes = {
    create: "/create"
}

// create team
router.route(teamRoutes.create).post(veryfyJWT, upload.single("logo"), createTeam)

export default router;