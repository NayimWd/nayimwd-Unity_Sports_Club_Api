import { createTournament } from "./create.controller";
import {
  getAllTournaments,
  getTournamentsByStatus,
  getTournamentById,
  getLatestTournament,
} from "./get.controller";
import { updateTournamentDetails } from "./updateDetails.controller";
import { updateDate } from "./updatedate.controller";
import { updateTournamentPhoto } from "./updatePhoto.controller";
import { updateTournamentStatus } from "./updateStatur.controller";
import { getTeamsOfTournament } from "./getTeamsOfTournament.controller";
import { createTournamentResult } from "./createResult.controller";

export {
  createTournament,
  getAllTournaments,
  getTournamentsByStatus,
  getTournamentById,
  updateTournamentDetails,
  updateDate,
  updateTournamentPhoto,
  updateTournamentStatus,
  getTeamsOfTournament,
  createTournamentResult,
  getLatestTournament,
};
