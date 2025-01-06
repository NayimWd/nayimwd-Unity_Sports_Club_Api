import { Router } from "express";

const router = Router();

interface IProfile {
    create: "/create",
    update: "/update",
    details: "/details",
    get_team_profile: "/get_team_prorile"
};

const profileRoutes: IProfile = {
    create: "/create",
    update: "/update",
    details: "/details",
    get_team_profile: "/get_team_prorile"
}



export default router;