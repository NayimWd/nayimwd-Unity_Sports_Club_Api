import { Router } from "express";
import { availablePlayerDetails, getAvailablePlayers } from "../../controller/players";


const router = Router();

// interface
interface IPlayer {
  available_players: "/available_players";
  available_player_details: "/available_player_details/:playerId";
};

// routes
const playerRoutes: IPlayer = {
  available_players: "/available_players",
  available_player_details: "/available_player_details/:playerId"
};

// available players
router.route(playerRoutes.available_players).get(getAvailablePlayers);
// available player details
router.route(playerRoutes.available_player_details).get(availablePlayerDetails);


export default router;