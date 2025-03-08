import { Router, Request, Response } from "express";
import userRoutes from "./user/user.routes";
import teamRoutes from "./team/team.routes";
import profileRoutes from "./profile/profile.routes";
import playerRoutes from "./player/player.routes";
import venueRoutes from "./venue/venue.routes";
import tournamentRoutes from "./tournament/tournament.routes";
import RegistrationRoutes from "./registration/registeration.routes";
import scheduleRoutes from "./schedule/schedule.routes";
import matchRoutes from "./match/match.routes"
import iningsRoutes from "./innings/innings.routes";
import pointTableRoutes from "./pointTable/pointTable.routes"
import blogRoutes from "./blog/blog.routes";

const router = Router();

// creating interface for semi root routes path
type RoutePath = {
  health: `/api/v1/health`;
  user: "/api/v1/auth";
  team: "/api/v1/team";
  profile: "/api/v1/profile";
  player: "/api/v1/player";
  venue: "/api/v1/venue";
  tournament: "/api/v1/tournament";
  registration: "/api/v1/tournamentRegister";
  schedule: "/api/v1/schedule";
  match: "/api/v1/match";
  innings: "/api/v1/innings";
  pointTable: "/api/v1/pointTable";
  blog: "/api/v1/blog";
}

// creating routes for semi root routes path
const route_path: RoutePath = {
  health: "/api/v1/health",
  user: "/api/v1/auth",
  team: "/api/v1/team",
  profile: "/api/v1/profile",
  player: "/api/v1/player",
  venue: "/api/v1/venue",
  tournament: "/api/v1/tournament",
  registration: "/api/v1/tournamentRegister",
  schedule: "/api/v1/schedule",
  match: "/api/v1/match",
  innings: "/api/v1/innings",
  pointTable: "/api/v1/pointTable",
  blog: "/api/v1/blog",
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
router.use(route_path.profile, profileRoutes);
// ---------- player routes ----------------
router.use(route_path.player, playerRoutes);
// ---------- venue routes ----------------
router.use(route_path.venue, venueRoutes);
// ---------- tournament routes ----------------
router.use(route_path.tournament, tournamentRoutes);
// ---------- registration routes ----------------
router.use(route_path.registration, RegistrationRoutes);
// ---------- schedule routes ----------------
router.use(route_path.schedule, scheduleRoutes);
// ---------- match routes ----------------
router.use(route_path.match, matchRoutes);
// ---------- Innings routes ----------------
router.use(route_path.innings, iningsRoutes)
// ---------- Point Table routes ----------------
router.use(route_path.pointTable, pointTableRoutes)
// ---------- Blog routes ----------------
router.use(route_path.blog, blogRoutes);

export default router;
