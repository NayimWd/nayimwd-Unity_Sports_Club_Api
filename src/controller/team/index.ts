import { createTeam } from "./createTeam.controller";
import { updateTeamName } from "./updateTeam.controller";
import { updateTeamLogo } from "./updateTeam.controller";
import { getAllTeams, getTeamDetails, getMyteam } from "./getTeams.controller";
import { deleteTeam } from "./deleteTeam.controller";
import { addPlayers } from "./addPlayers/addPlayers.controller";
import { getAllTeamMembers, getTeamPlayerDetails } from "./getTeamPlayers.controller";
import { removePlayers } from "./addPlayers/removePlayers.controller";
import { makeCaptain } from "./makeCaptain.controller";



export {
    createTeam,
    updateTeamName,
    updateTeamLogo,
    getAllTeams,
    getTeamDetails,
    getMyteam,
    deleteTeam,
    addPlayers,
    removePlayers,
    getAllTeamMembers,
    getTeamPlayerDetails,
    makeCaptain,
    
}