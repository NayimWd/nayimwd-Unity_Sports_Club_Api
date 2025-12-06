import { connectMongoDB } from "./mongodb";
import { initRedis } from "./redis";

export async function initDataBases() {
  try {
    // connect mongodb
    await connectMongoDB();

    // connect redis
    await initRedis();

  } catch (error) {
    console.error("Database initialization failed:", error);
    process.exit(1);
  }
}
