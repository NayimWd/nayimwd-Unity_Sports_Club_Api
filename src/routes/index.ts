import { Router, Request, Response } from "express";
import userRoutes from "./user/user.routes";
import teamRoutes from "./team/team.routes";

const router = Router();

// creating interface for semi root routes path
interface IRoutePath {
  health: "/api/v1/health";
  user: "/api/v1/auth";
  team: "/api/v1/team";
}

// creating routes for semi root routes path
const route_path: IRoutePath = {
  health: "/api/v1/health",
  user: "/api/v1/auth",
  team: "/api/v1/team",
};

// Health check route with proper typing
const healthCheck: any = (req: Request, res: Response) => {
  res.status(200).json({ message: "API Health check" });
};

// health checke route
router.get(route_path.health, healthCheck);
// ---------- user routes ----------------
router.use(route_path.user, userRoutes);
// ---------- user routes ----------------
router.use(route_path.team, teamRoutes);

export default router;
