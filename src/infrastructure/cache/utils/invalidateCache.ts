// src/utils/cache/invalidateCache.ts
import { cacheKeys, CachePatterns } from "./cacheKeys";
import CacheService from "../cache.service";

export const invalidateCache = {
  player: {
    list: () => CacheService.deleteByPattern(CachePatterns.list("player")),
    details: (id: string) => CacheService.deleteCache(cacheKeys.playerDetails(id)),
  },

  tournament: {
    list: () => CacheService.deleteByPattern(CachePatterns.list("tournament")),
    details: (id: string) => CacheService.deleteCache(cacheKeys.tournamentDetails(id)),
    results: (id: string) => CacheService.deleteCache(cacheKeys.tournamentResult(id)),
    pointTable: (id: string) => CacheService.deleteCache(cacheKeys.pointTable(id)),
  },

  team: {
    list: () => CacheService.deleteByPattern(CachePatterns.list("team")),
    details: (id: string) => CacheService.deleteCache(cacheKeys.teamDetails(id)),
  },

  match: {
    list: (tournamentId: string) => CacheService.deleteByPattern(cacheKeys.matchList(tournamentId)),
    details: (id: string) => CacheService.deleteCache(cacheKeys.matchDetails(id)),
    result: (id: string) => CacheService.deleteCache(cacheKeys.matchResult(id)),
  },

  venue: {
    list: () => CacheService.deleteByPattern(CachePatterns.list("venue")),
    details: (id: string) => CacheService.deleteCache(cacheKeys.venueDetails(id)),
    booking: (id: string) => CacheService.deleteCache(cacheKeys.venueBooking(id)),
  },

  blog: {
    list: () => CacheService.deleteByPattern(CachePatterns.list("blog")),
    details: (id: string) => CacheService.deleteCache(cacheKeys.blogDetails(id)),
  },
};
