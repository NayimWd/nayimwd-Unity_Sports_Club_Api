import { createClient } from "redis";

// create redis client
const redis = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 3000),
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
