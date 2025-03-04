import { createTournament } from "./create.controller";
import {
  getAllTournaments,
  getTournamentsByStatus,
  getTournamentById,
} from "./get.controller";
import { updateTournamentDetails } from "./updateDetails.controller";
import { updateDate } from "./updatedate.controller";
import { updateTournamentPhoto } from "./updatePhoto.controller";
import { updateTournamentStatus } from "./updateStatur.controller";
import { getTeamsOfTournament } from "./getTeamsOfTournament.controller";

export {
  createTournament,
  getAllTournaments,
  getTournamentsByStatus,
  getTournamentById,
  updateTournamentDetails,
  updateDate,
  updateTournamentPhoto,
  updateTournamentStatus,
  getTeamsOfTournament
};
