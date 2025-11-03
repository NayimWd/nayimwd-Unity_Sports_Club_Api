import { Router } from "express";
import { getPointTable } from "../../controller/pointTable";

const router = Router();

// route type
type PointTable = {
  get: "/get/:tournamentId";
};

const pointTableRoutes: PointTable = {
  get: "/get/:tournamentId",
};

// get point table
router.route(pointTableRoutes.get).get(getPointTable);

export default router;
