import dotenv from "dotenv";
import app from "./app/app";

dotenv.config();

import { initDataBases } from "./infrastructure/database";


const port = process.env.PORT || 8000;

// db connect
async function startServer() {
  await initDataBases();

  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
}

startServer();
