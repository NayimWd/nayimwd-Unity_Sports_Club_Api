import { createClient } from "redis";

// create redis client
const redis = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 4) return null; 
      return Math.min(retries * 100, 2000);
    }
  },
});

// events
redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.error("Redis Error", err));

export async function initRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}

export default redis;
