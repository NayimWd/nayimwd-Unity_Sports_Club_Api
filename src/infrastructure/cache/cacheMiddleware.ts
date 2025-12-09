import { Request, Response, NextFunction, response } from "express";
import { buildCacheKey } from "./utils/keyBuilder";
import CacheService from "./cache.service";
import { ApiResponse } from "../../utils/ApiResponse";

interface CacheOption {
  key: string;
  ttl: number;
}

export function cacheMiddleware(options: CacheOption) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { key, ttl = 3600 } = options;

    // build keys for normalized data, including qeury params if exists
    const finalKey = buildCacheKey(key, req.query);

    try {
      const cacheData = await CacheService.getCache(finalKey);

      if (cacheData) {
        return res
          .status(200)
          .json(new ApiResponse(200, cacheData, "from redis cache"));
      }

      // response override in controller
      const originalJson = res.json.bind(res);

      if (res.json !== null)
        res.json = (body: any) => {
          CacheService.setCache(finalKey, body, ttl).catch((err) => {
            console.error("Cache set error:", err);
          });

          return originalJson(body);
        };

      next();
    } catch (error) {
      console.error("Cache middleware error: ", error);
      next();
    }
  };
}
