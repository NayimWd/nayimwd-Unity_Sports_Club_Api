import { Router, Request, Response } from "express";
import userRoutes from "./user/user.routes";
import teamRoutes from "./team/team.routes";
import profileRoutes from "./profile/profile.routes"
import playerRoutes from "./player/player.routes";
import venueRoutes from "./venue/venue.routes";
import tournamentRoutes from "./tournament/tournament.routes";
import RegistrationRoutes from "./registration/registeration.routes";

const router = Router();

// creating interface for semi root routes path
interface IRoutePath {
  health: "/api/v1/health";
  user: "/api/v1/auth";
  team: "/api/v1/team";
  profile: "/api/v1/profile";
  player: "/api/v1/player";
  venue: "/api/v1/venue";
  tournament: "/api/v1/tournament";
  registration: "/api/v1/tournamentRegister"
}

// creating routes for semi root routes path
const route_path: IRoutePath = {
  health: "/api/v1/health",
  user: "/api/v1/auth",
  team: "/api/v1/team",
  profile: "/api/v1/profile",
  player: "/api/v1/player",
  venue: "/api/v1/venue",
  tournament: "/api/v1/tournament",
  registration: "/api/v1/tournamentRegister"
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
// ---------- venue routes ----------------
router.use(route_path.venue, venueRoutes);
// ---------- tournament routes ----------------
router.use(route_path.tournament, tournamentRoutes);
// ---------- registration routes ----------------
router.use(route_path.registration, RegistrationRoutes);

export default router;
