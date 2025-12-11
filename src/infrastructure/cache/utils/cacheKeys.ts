/**
 * -----------------------------------------------------
 *  CACHE GROUPS — used for invalidation
 * -----------------------------------------------------
 *  Groups = logical dependencies.
 *  When something changes, you invalidate the entire group.
 * -----------------------------------------------------
 */
export const CacheGroups = {
  // TEAM
  TEAM: (teamId: string) => `group:team:${teamId}`,
  TEAM_LIST: `group:team:list`,

  // PLAYER
  PLAYER: (playerId: string) => `group:player:${playerId}`,
  PLAYER_LIST: `group:player:list`,

  // TOURNAMENT
  TOURNAMENT: (tournamentId: string) => `group:tournament:${tournamentId}`,
  TOURNAMENT_LIST: `group:tournament:list`,
  TOURNAMENT_RESULT: (tournamentId: string) =>
    `group:tournament:result:${tournamentId}`,
  POINT_TABLE: (tournamentId: string) => `group:pointtable:${tournamentId}`,

  // SCHEDULE (per tournament)
  SCHEDULE: (tournamentId: string) => `group:schedule:${tournamentId}`,

  // MATCH
  MATCH: (matchId: string) => `group:match:${matchId}`,
  MATCH_LIST: (tournamentId: string) => `group:match:list:${tournamentId}`,

  // VENUE
  VENUE: (venueId: string) => `group:venue:${venueId}`,
  VENUE_LIST: `group:venue:list`,

  // BLOG
  BLOG: (id: string) => `group:blog:${id}`,
  BLOG_LIST: `group:blog:list`,
};

/**
 * -----------------------------------------------------
 *  ACTUAL CACHE KEYS — actual cached responses
 * -----------------------------------------------------
 */
export const cacheKeys = {
  // TEAM
  teamList: `team:list`,
  teamDetails: (teamId: string) => `team:details:${teamId}`,

  // PLAYER
  playerList: `player:list`,
  playerDetails: (playerId: string) => `player:details:${playerId}`,

  // TOURNAMENT
  tournamentList: `tournament:list`,
  tournamentDetails: (tournamentId: string) => `tournament:details:${tournamentId}`,
  latestTournament: `tournament:latest`,
  latestTournamentResult: `tournament:latestResult`,
  tournamentResult: (tournamentId: string) => `tournament:result:${tournamentId}`,
  pointTable: (tournamentId: string) => `pointtable:${tournamentId}`,

  // SCHEDULE
  scheduleByTournament: (tournamentId: string) => `schedule:tournament:${tournamentId}`,

  // MATCH
  matchList: (tournamentId: string) => `match:list:${tournamentId}`,
  matchDetails: (matchId: string) => `match:details:${matchId}`,
  matchResult: (matchId: string) => `match:result:${matchId}`,

  // INNINGS (optional, embedded in match)
  inningsDetails: (matchId: string) => `innings:${matchId}`,

  // VENUE
  venueList: `venue:list`,
  venueDetails: (venueId: string) => `venue:details:${venueId}`,
  venueBooking: (venueId: string) => `venue:booking:${venueId}`,

  // BLOG
  blogList: `blog:list`,
  blogDetails: (blogId: string) => `blog:details:${blogId}`,
};

/**
 * -----------------------------------------------------
 *  PATTERN HELPERS — wildcard invalidation
 * -----------------------------------------------------
 */
export const CachePatterns = {
  byTeam: (teamId: string) => `*team:*${teamId}*`,
  byPlayer: (playerId: string) => `*player:*${playerId}*`,
  byTournament: (tournamentId: string) => `*tournament:*${tournamentId}*`,
  byMatch: (matchId: string) => `*match:*${matchId}*`,
  byVenue: (venueId: string) => `*venue:*${venueId}*`,
  byBlog: (blogId: string) => `*blog:*${blogId}*`,
  list: (name: string) => `*${name}:list*`,
};
