import { Router } from "express";
import { veryfyJWT } from "../../middleware/auth.middleware";
import {
  create_PlayerProfile,
  createManagerProfile,
  createUmpireProfile,
  getManagerProfile,
  getPlayerProfile,
  getUmpireProfile,
  getTeamProfiles,
  getProfileDetails,
  updatePlayerProfile,
  updateManagerProfile,
  updateUmpireProfile,
} from "../../controller/profile";

const router = Router();

type Profile = {
  create_player_profile: "/create_player_profile";
  create_manager_profile: "/create_manager_profile";
  create_umpire_profile: "/create_umpire_profile";
  update: "/update";
  details: "/details";
  get_player_profile: "/get_player_profile";
  get_manager_profile: "/get_manager_profile";
  get_umpire_profile: "/get_umpire_profile";
  get_team_profiles: "/get_team_profiles/:teamId";
  get_profile_details: "/get_profile_details/:id";
  update_playerProfile: "/update_playerProfile_details/:id";
  update_managerProfile_details: "/update_managerProfile_details/:id";
  update_umpireProfile_details: "/update_umpireProfile_details/:id";
};

const profileRoutes: Profile = {
  create_player_profile: "/create_player_profile",
  create_manager_profile: "/create_manager_profile",
  create_umpire_profile: "/create_umpire_profile",
  update: "/update",
  details: "/details",
  get_player_profile: "/get_player_profile",
  get_manager_profile: "/get_manager_profile",
  get_umpire_profile: "/get_umpire_profile",
  get_team_profiles: "/get_team_profiles/:teamId",
  get_profile_details: "/get_profile_details/:id",
  update_playerProfile: "/update_playerProfile_details/:id",
  update_managerProfile_details: "/update_managerProfile_details/:id",
  update_umpireProfile_details: "/update_umpireProfile_details/:id",
};

// create profile for players
router
  .route(profileRoutes.create_player_profile)
  .post(veryfyJWT, create_PlayerProfile);
// create profile for managers
router
  .route(profileRoutes.create_manager_profile)
  .post(veryfyJWT, createManagerProfile);
// create profile for umpires
router
  .route(profileRoutes.create_umpire_profile)
  .post(veryfyJWT, createUmpireProfile);
// get player profile
router.route(profileRoutes.get_player_profile).get(veryfyJWT, getPlayerProfile);
// get manager profile
router
  .route(profileRoutes.get_manager_profile)
  .get(veryfyJWT, getManagerProfile);
// get umpire profile
router.route(profileRoutes.get_umpire_profile).get(veryfyJWT, getUmpireProfile);
// get team profiles
router.route(profileRoutes.get_team_profiles).get(getTeamProfiles);
// get profile details
router.route(profileRoutes.get_profile_details).get(getProfileDetails);
// update player profile
router.route(profileRoutes.update_playerProfile).patch(updatePlayerProfile);
// update manager profile
router
  .route(profileRoutes.update_managerProfile_details)
  .patch(updateManagerProfile);
// update umpire profile
router
  .route(profileRoutes.update_umpireProfile_details)
  .patch(updateUmpireProfile);

export default router;
