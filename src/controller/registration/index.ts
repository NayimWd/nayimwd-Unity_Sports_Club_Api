import { applyForTournament } from "./applyForTournament.controller";
import { getTournamentApplication, getPendingRegistration } from "./getApplications.controller";
import { updateStatus } from "./updateStatus.controller";
import { withdrawApplication } from "./withdrawApplication.controller";
import { reApplyForTournament } from "./reApplyForTournament.controller";

export {
    applyForTournament,
    getTournamentApplication,
    updateStatus,
    withdrawApplication,
    reApplyForTournament
}