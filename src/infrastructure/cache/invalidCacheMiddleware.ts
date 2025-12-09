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

  // set value to redis with ttl
  static async setCache(
    key: string,
    value: any,
    ttl: number = 3600
  ): Promise<void> {
    try {
      const payload = JSON.stringify(value);
      if (ttl === 0) {
        // if ttl = 0 set permanently
        await redis.set(key, payload);
      } else {
        await redis.setEx(key, ttl, payload);
      }
    } catch (error) {
      console.error("Redis cache error", error);
    }
  }

  //delete cache for a specefic key
  static async deleteCache(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error("Redis delete cache error", error);
    }
  }

  // delete cache group keys with pattern
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
}

export default CacheService;
