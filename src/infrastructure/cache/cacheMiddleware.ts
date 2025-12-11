import { buildCacheKey } from "./utils/keyBuilder";
import CacheService from "./cache.service";


interface CacheOption {
  key: string;
  ttl?: number;
  groups?: string[]; // group keys to register this cache under
}

export const cacheMiddleware = ({ key, ttl = 3600, groups = [] }: CacheOption) => {
  return async (req, res, next) => {
    const finalKey = buildCacheKey(key, req.query); // ← normalized key
    const cached = await CacheService.getCache(finalKey);
    
    if (cached) {
      res.setHeader('X-Cache-Status', 'HIT'); //  cache header
      return res.status(200).json(cached);
    }
    
    res.setHeader('X-Cache-Status', 'MISS');
    const originalJson = res.json.bind(res);
    
    res.json = (body) => {
      originalJson(body);
      
      if (res.statusCode >= 200 && res.statusCode < 300) { // ← only cache success
        (async () => {
          await CacheService.setCache(finalKey, body, ttl, groups);
        })();
      }
      
      return body;
    };
    
    next();
  };
};

