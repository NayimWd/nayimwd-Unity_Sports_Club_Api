import { Router, Request, Response } from "express";
import userRoutes from "./user/user.routes";
import teamRoutes from "./team/team.routes";
import profileRoutes from "./profile/profile.routes"
import playerRoutes from "./player/player.routes";

const router = Router();

// creating interface for semi root routes path
interface IRoutePath {
  health: "/api/v1/health";
  user: "/api/v1/auth";
  team: "/api/v1/team";
  profile: "/api/v1/profile";
  player: "/api/v1/player"
}

// creating routes for semi root routes path
const route_path: IRoutePath = {
  health: "/api/v1/health",
  user: "/api/v1/auth",
  team: "/api/v1/team",
  profile: "/api/v1/profile",
  player: "/api/v1/player"
};

// Health check route with proper typing
const healthCheck: any = (req: Request, res: Response) => {
  res.status(200).json({ message: "API Health check" });
};

// health checke route
router.get(route_path.health, healthCheck);
// ---------- user routes ----------------
router.use(route_path.user, userRoutes);
// ---------- team routes ----------------
router.use(route_path.team, teamRoutes);
// ---------- profile routes ----------------
router.use(route_path.profile, profileRoutes)
// ---------- player routes ----------------
router.use(route_path.player, playerRoutes)

export default router;
