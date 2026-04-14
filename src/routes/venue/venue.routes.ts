import { Router } from "express";
import {
  createVenue,
  deleteVenue,
  getAllVenues,
  updateVenueDetails,
  updateVenuePhoto,
  venueDetails,
  venueSearch,
} from "../../controller/venue";
import { veryfyJWT } from "../../middleware/auth.middleware";
import { upload } from "../../middleware/multer.middleware";

const router = Router();

// interface
type VenueRoutes = {
  create: "/create";
  all: "/all";
  details: "/details/:venueId";
  update: "/update/:venueId";
  updatePhoto: "/updatePhoto/:venueId";
  delete: "/delete/:venueId";
  search: "/search";
};

const venue_routes: VenueRoutes = {
  create: "/create",
  all: "/all",
  details: "/details/:venueId",
  update: "/update/:venueId",
  updatePhoto: "/updatePhoto/:venueId",
  delete: "/delete/:venueId",
  search: "/search",
};

// routes
// create venue
router
  .route(venue_routes.create)
  .post(veryfyJWT, upload.single("photo"), createVenue);
// get all venues
router.route(venue_routes.all).get(getAllVenues);
// get venue details
router.route(venue_routes.details).get(venueDetails);
// get search venue
router.route(venue_routes.search).get(venueSearch);
// update venue details
router.route(venue_routes.update).patch(veryfyJWT, updateVenueDetails);
// update venue photo
router
  .route(venue_routes.updatePhoto)
  .patch(veryfyJWT, upload.single("photo"), updateVenuePhoto);
// delete venue
router.route(venue_routes.delete).delete(veryfyJWT, deleteVenue);
export default router;
