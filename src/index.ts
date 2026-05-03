import dotenv from "dotenv";

dotenv.config();
console.log("CORS Origins:", process.env.CORS_ORIGIN);
import app from "./app/app";
import { initDataBases } from "./infrastructure/database";
import { disconnectMongoDB } from "./infrastructure/database/mongodb";
import { logger } from "./lib/logger";

const port = process.env.PORT || 8000;

// handle unexpected errors
process.on("uncaughtException", (err) => {
  logger.error(err, "Uncaught Exception");
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  logger.error(err, "Unhandled Rejection");
  process.exit(1);
});

// graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down...");
  await disconnectMongoDB();
  process.exit(0);
});

// db connect
async function startServer() {
  await initDataBases();

  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
}

startServer();
