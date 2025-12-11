import redis from "../database/redis";

class CacheService {
  // get values from redis and convert to json
  static async getCache<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      if (!data) return null;

      const stringData = typeof data === "string" ? data : data.toString();
      return JSON.parse(stringData) as T;
    } catch (error) {
      console.error("Redis get cache error", error);
      return null;
    }
  }

  /**
   * Set value to redis with ttl
   * If ttl === 0 → permanent (no expire)
   * Optionally register the key to one or more groups (Redis Sets)
   */
  static async setCache(
    key: string,
    value: any,
    ttl: number = 3600,
    groups?: string[]
  ): Promise<void> {
    try {
      const payload = JSON.stringify(value);

      if (ttl === 0) {
        await redis.set(key, payload);
      } else {
        // setEx sets with expiration in seconds
        await redis.setEx(key, ttl, payload);
      }

      // register key in provided groups (so we can invalidate by group)
      if (Array.isArray(groups) && groups.length > 0) {
        // use SADD for each group
        for (const group of groups) {
          try {
            // add the cache key to the group set
            await redis.sAdd(group, key);
          } catch (err) {
            console.error("Redis add key to group error:", err);
          }
        }
      }
    } catch (error) {
      console.error("Redis setCache error", error);
    }
  }

  // delete a specific key
  static async deleteCache(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error("Redis delete cache error", error);
    }
  }

  // delete keys by wildcard pattern (scan + del)
  static async deleteByPattern(pattern: string): Promise<void> {
    try {
      const iter = redis.scanIterator({
        MATCH: pattern,
        COUNT: 100,
      });

      for await (const key of iter) {
        await redis.del(key as any);
      }
    } catch (error) {
      console.error("Redis delete key group pattern error", error);
    }
  }

  /**
   * Delete a group: read all members from the group's Redis Set,
   * delete each member (cache keys), then delete the group set itself.
   */
  static async deleteGroup(groupKey: string): Promise<void> {
    try {
      // get all members of the set
      const members = await redis.sMembers(groupKey);
      const memberArray = Array.isArray(members) ? members : Array.from(members);
      if (memberArray && memberArray.length > 0) {
        // delete all cache keys in this group
        // use pipeline for efficiency
        const pipeline = redis.multi();
        for (const memberKey of memberArray) {
          pipeline.del(memberKey);
        }
        // also delete the set itself
        pipeline.del(groupKey);
        await pipeline.exec();
      } else {
        // if set exists but no members, remove the set just in case
        await redis.del(groupKey);
      }
    } catch (error) {
      console.error("Redis deleteGroup error:", error);
    }
  }
}

export default CacheService;
