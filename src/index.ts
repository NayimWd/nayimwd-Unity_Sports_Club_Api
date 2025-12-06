import dotenv from "dotenv";
import connectDB from "./db";
import app from "./app/app";
import { initDataBases } from "./infrastructure/database";

dotenv.config();

const port = process.env.PORT || 8000;

// db connect
async function startServer() {
  await initDataBases();

  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
}

startServer();
