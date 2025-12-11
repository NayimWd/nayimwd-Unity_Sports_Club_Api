import { Request, Response, NextFunction } from "express";
import CacheService from "./cache.service";

export const invalidateCacheMiddleware = (groups: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // keep reference to original res.send
    const originalSend = res.send.bind(res);

    (res.send as any) = (body?: any) => {
      // call original send first (so client gets response ASAP),
      // but invalidate groups concurrently (we await to ensure invalidation attempted)
      try {
        // send response
        const result = originalSend(body);

        // invalidate groups asynchronously (do not block client long)
        (async () => {
          try {
            for (const group of groups) {
              await CacheService.deleteGroup(group);
            }
          } catch (err) {
            console.error("Cache Invalidation Error:", err);
          }
        })();

        return result;
      } catch (err) {
        // if send fails, still try to invalidate
        (async () => {
          for (const group of groups) {
            try {
              await CacheService.deleteGroup(group);
            } catch (e) {
              console.error("Cache Invalidation Error during fallback:", e);
            }
          }
        })();
        throw err;
      }
    };

    next();
  };
};
