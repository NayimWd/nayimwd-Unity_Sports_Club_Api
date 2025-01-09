import { Router } from "express";
import { veryfyJWT } from "../../middleware/auth.middleware";
import { create_PlayerProfile, createManagerProfile, createUmpireProfile, getManagerProfile, getPlayerProfile, getUmpireProfile } from "../../controller/profile";

const router = Router();

interface IProfile {
    create_player_profile: "/create_player_profile",
    create_manager_profile: "/create_manager_profile",
    create_umpire_profile: "/create_umpire_profile",
    update: "/update",
    details: "/details",
    get_player_profile: "/get_player_profile",
    get_manager_profile: "/get_manager_profile",
    get_umpire_profile: "/get_umpire_profile"
};

const profileRoutes: IProfile = {
    create_player_profile: "/create_player_profile",
    create_manager_profile: "/create_manager_profile",
    create_umpire_profile: "/create_umpire_profile",
    update: "/update",
    details: "/details",
    get_player_profile: "/get_player_profile",
    get_manager_profile: "/get_manager_profile",
    get_umpire_profile: "/get_umpire_profile"
 
}

// create profile for players
router.route(profileRoutes.create_player_profile).post(veryfyJWT, create_PlayerProfile);
// create profile for managers
router.route(profileRoutes.create_manager_profile).post(veryfyJWT, createManagerProfile);
// create profile for umpires
router.route(profileRoutes.create_umpire_profile).post(veryfyJWT, createUmpireProfile);
// get player profile
router.route(profileRoutes.get_player_profile).get(veryfyJWT, getPlayerProfile)
// get manager profile
router.route(profileRoutes.get_manager_profile).get(veryfyJWT, getManagerProfile)
// get umpire profile
router.route(profileRoutes.get_umpire_profile).get(veryfyJWT, getUmpireProfile)


export default router;