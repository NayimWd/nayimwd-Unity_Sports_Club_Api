import CacheService from "./cache.service";

export const invalidateCacheMiddleware = (groups: string[]) => {
  return async (req, res, next) => {
    const originalSend = res.send.bind(res);

    res.send = (body) => {
      originalSend(body);

      // only invalidate on successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        (async () => {
          try {
            for (const group of groups) {
              if (group && typeof group === "string" && group.trim()) {
                console.log("♻️ Invalidating group:", group);
                await CacheService.deleteGroup(group); // delete by group
              }
            }
          } catch (err) {
            console.error("❌ Cache Invalidation Error:", err);
          }
        })();
      }

      return body;
    };

    next();
  };
};
