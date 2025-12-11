import { Request, Response, NextFunction, response } from "express";
import { buildCacheKey } from "./utils/keyBuilder";
import CacheService from "./cache.service";
import { ApiResponse } from "../../utils/ApiResponse";

interface CacheOption {
  key: string;
  ttl?: number;
  groups?: string[]; // group keys to register this cache under
}

export function cacheMiddleware(options: CacheOption) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { key, ttl = 3600 } = options;

    const finalKey = buildCacheKey(key, req.query);

    try {
      const cacheData = await CacheService.getCache(finalKey);

      if (cacheData) {
        // send cached response as-is
        res.status(200).json(cacheData);
        return; // stop further processing
      }

      // override res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        CacheService.setCache(finalKey, body, ttl).catch((err) => {
          console.error("Cache set error:", err);
        });
        return originalJson(body);
      };

      next(); // continue to controller
    } catch (error) {
      console.error("Cache middleware error: ", error);
      next();
    }
  };
}
