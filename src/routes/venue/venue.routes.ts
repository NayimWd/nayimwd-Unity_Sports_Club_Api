import { Router } from "express";
import {
  createVenue,
  deleteVenue,
  getAllVenues,
  updateVenue,
  venueDetails,
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
  delete: "/delete/:venueId";
};

const venue_routes: VenueRoutes = {
  create: "/create",
  all: "/all",
  details: "/details/:venueId",
  update: "/update/:venueId",
  delete: "/delete/:venueId",
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
// update venue
router
  .route(venue_routes.update)
  .patch(veryfyJWT, upload.single("photo"), updateVenue);
// delete venue
router.route(venue_routes.delete).delete(veryfyJWT, deleteVenue);
export default router;
