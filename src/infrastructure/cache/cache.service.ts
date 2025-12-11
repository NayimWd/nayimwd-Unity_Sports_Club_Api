import redis from "../database/redis";

class CacheService {
  /**
   * GET CACHE
   */
  static async getCache<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      if (!data) return null;

      const dataString = typeof data === "string" ? data : data.toString();
      return JSON.parse(dataString) as T;
    } catch (error) {
      console.error("Redis get cache error", error);
      return null;
    }
  }

  /**
   * SET CACHE + GROUP REGISTRATION
   */
  static async setCache(
    key: string,
    value: any,
    ttl: number = 3600,
    groups?: string[]
  ): Promise<void> {
    try {
      const payload = JSON.stringify(value);

        await redis.setEx(key, ttl, payload);
    
      // --- FIX: sanitize keys before saving to groups ---
      if (Array.isArray(groups) && groups.length > 0) {
        for (const group of groups) {
          if (
            typeof key === "string" &&
            key.trim().length > 0 &&
            typeof group === "string" &&
            group.trim().length > 0
          ) {
            await redis.sAdd(group, key);
          }
        }
      }
    } catch (error) {
      console.error("Redis setCache error", error);
    }
  }

  /**
   * DELETE SINGLE KEY
   */
  static async deleteCache(key: string): Promise<void> {
    try {
      if (key && key.trim().length > 0) {
        await redis.del(key);
      }
    } catch (error) {
      console.error("Redis delete cache error", error);
    }
  }

  /**
   * DELETE BY WILDCARD PATTERN (SAFE)
   */
  static async deleteByPattern(pattern: string): Promise<void> {
    try {
      const iterator = redis.scanIterator({
        MATCH: pattern,
        COUNT: 100,
      });

      for await (const key of iterator) {
        if (key && typeof key === "string" && (key as any)?.trim().length > 0) {
          await redis.del(key);
        }
      }
    } catch (error) {
      console.error("Redis delete key by pattern error", error);
    }
  }

  /**
   * DELETE A GROUP + ALL STORE KEYS
   */
  static async deleteGroup(groupKey: string): Promise<void> {
    try {
      if (!groupKey || !groupKey.trim().length) return;

      const members = await redis.sMembers(groupKey);

      if (Array.isArray(members) && members.length > 0) {
        const pipeline = redis.multi();

        for (const key of members) {
          if (key && key.length > 0) {
            pipeline.del(key);
          }
        }

        pipeline.del(groupKey);

        await pipeline.exec();
      } else {
        // no members but group still exists
        await redis.del(groupKey);
      }
    } catch (error) {
      console.error("Redis deleteGroup error", error);
    }
  }
}

export default CacheService;
