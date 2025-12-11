import { CacheGroups } from "./cacheKeys";
import CacheService from "../cache.service";

export const invalidateCache = {
  // TEAM
  onTeamUpdate: async (teamId: string) => {
    await CacheService.deleteGroup(CacheGroups.TEAM(teamId));
    await CacheService.deleteGroup(CacheGroups.TEAM_LIST);
  },

  // PLAYER
  onPlayerUpdate: async (playerId: string) => {
    await CacheService.deleteGroup(CacheGroups.PLAYER(playerId));
    await CacheService.deleteGroup(CacheGroups.PLAYER_LIST);
    // many pages reference player, also clear match/tournament groups if needed:
    await CacheService.deleteGroup(CacheGroups.MATCH_LIST("*")); // optional broad clear if you used wildcard groups
  },

  // TOURNAMENT
  onTournamentUpdate: async (tournamentId: string) => {
    await CacheService.deleteGroup(CacheGroups.TOURNAMENT(tournamentId));
    await CacheService.deleteGroup(CacheGroups.TOURNAMENT_LIST);
    await CacheService.deleteGroup(CacheGroups.POINT_TABLE(tournamentId));
    await CacheService.deleteGroup(CacheGroups.TOURNAMENT_RESULT(tournamentId));
  },

  // SCHEDULE
  onScheduleUpdate: async (tournamentId: string) => {
    await CacheService.deleteGroup(CacheGroups.SCHEDULE(tournamentId));
    await CacheService.deleteGroup(CacheGroups.MATCH_LIST(tournamentId));
  },

  // MATCH
  onMatchUpdate: async (matchId: string, tournamentId?: string) => {
    await CacheService.deleteGroup(CacheGroups.MATCH(matchId));
    if (tournamentId)
      await CacheService.deleteGroup(CacheGroups.MATCH_LIST(tournamentId));
  },

  // MATCH RESULT -> affects match, point table, tournament result
  onMatchResultUpdate: async (matchId: string, tournamentId: string) => {
    await CacheService.deleteGroup(CacheGroups.MATCH(matchId));
    await CacheService.deleteGroup(CacheGroups.MATCH_LIST(tournamentId));
    await CacheService.deleteGroup(CacheGroups.POINT_TABLE(tournamentId));
    await CacheService.deleteGroup(CacheGroups.TOURNAMENT_RESULT(tournamentId));
  },

  // VENUE
  onVenueUpdate: async (venueId: string) => {
    await CacheService.deleteGroup(CacheGroups.VENUE(venueId));
    await CacheService.deleteGroup(CacheGroups.VENUE_LIST);
  },

  // BLOG
  onBlogUpdate: async (blogId: string) => {
    await CacheService.deleteGroup(CacheGroups.BLOG(blogId));
    await CacheService.deleteGroup(CacheGroups.BLOG_LIST);
  },
};
