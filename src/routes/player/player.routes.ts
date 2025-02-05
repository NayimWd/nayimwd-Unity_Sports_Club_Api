import { Router } from "express";
import { getPlayerDetails, getAvailablePlayers } from "../../controller/players";


const router = Router();

// interface
type Player = {
  available_players: "/available_players";
  player_details: "/player_details/:playerId";
};

// routes
const playerRoutes: Player = {
  available_players: "/available_players",
  player_details: "/player_details/:playerId" 
};

// available players
router.route(playerRoutes.available_players).get(getAvailablePlayers);
// available player details
router.route(playerRoutes.player_details).get(getPlayerDetails);


export default router;