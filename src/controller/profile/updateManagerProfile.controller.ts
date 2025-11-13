import { ManagerProfile } from "../../models/profilesModel/managerProfile.model";
import { Team } from "../../models/teamModel/teams.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const updateManagerProfile = asyncHandler(async (req, res) => {
  const manager = (req as any).user;

  if (!manager?._id) throw new ApiError(400, "Invalid token, user not found");
  if (manager.role !== "manager")
    throw new ApiError(403, "User role is not manager");

  const profile = await ManagerProfile.findOne({ userId: manager._id });
  if (!profile) throw new ApiError(404, "Profile not found");

  const { teamId, removeTeamId, replaceTeams } = req.body;

  // validate team by team id
  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(404, "Team not found by this ID");
  }

  // validate manager authority
  if (team.managerId.toString() !== manager._id.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to add players to this team"
    );
  }

  // replace all teams
  if (Array.isArray(replaceTeams) && replaceTeams.length > 0) {
    (profile as any).teamsManaged = replaceTeams;
  }

  // add a team if not exists
  if (teamId && !profile.teamsManaged.includes(teamId)) {
    profile.teamsManaged.push(teamId);
  }

  // remove a team if exists
  if (removeTeamId) {
    (profile as any).teamsManaged = profile.teamsManaged.filter(
      (id) => id.toString() !== removeTeamId.toString()
    );
  }

  const updatedProfile = await profile.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedProfile,
        "Manager profile updated successfully"
      )
    );
});
