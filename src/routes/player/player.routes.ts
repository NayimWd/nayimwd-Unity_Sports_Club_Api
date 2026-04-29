import { Router } from "express";
import {
  getPlayerDetails,
  getAvailablePlayers,
  availablePlayerProfile,
} from "../../controller/players";
import { veryfyJWT } from "../../middleware/auth.middleware";

const router = Router();

// type
type Player = {
  available_players: "/available_players";
  available_players_profile: "/available_players_profile";
  player_details: "/player_details/:playerId";
};

// routes
const playerRoutes: Player = {
  available_players: "/available_players",
  player_details: "/player_details/:playerId",
  available_players_profile: "/available_players_profile"
};

// available players
router.route(playerRoutes.available_players).get(veryfyJWT, getAvailablePlayers);
// available players profile
router.route(playerRoutes.available_players_profile).get(veryfyJWT, availablePlayerProfile);
// available player details
router.route(playerRoutes.player_details).get(getPlayerDetails);

export default router;
