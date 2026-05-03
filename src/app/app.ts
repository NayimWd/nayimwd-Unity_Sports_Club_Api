import express, { Request, RequestHandler, Response } from "express";
import appMiddleware from "./appMiddleware";
import router from "../routes";
import setupSwagger from "../config/swagger-config";
import { requestId } from "../utils/requestId";
import { requestLogger } from "../middleware/requestLogger";
import { errorHandler } from "../middleware/errorHandler";
import { timeoutMiddleware } from "../middleware/timeout.middleware";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// initialize app
const app = express();

const allowedOrigins =
  process.env.CORS_ORIGIN?.split(",").map((o) => o.trim()) || [];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// cors
app.use(cors(corsOptions));

// cors - preflight
app.options("*", cors(corsOptions));

// middleware
app.use(...(appMiddleware as RequestHandler[]));

// setup swagger
setupSwagger(app);

// logger
app.use(requestId);
app.use(requestLogger);

// timeout handler
app.use(timeoutMiddleware({ ms: 25000 }));

// connect router
app.use(router);

// trust proxy
app.set("trust proxy", 1);

// error handler
app.use(errorHandler);

app.get("/api/v1", (req, res) => {
  res.json({
    message: "Unity Sports Club API v1 🏆",
    docs: "https://nayimwd-unitysportsclubapi-production.up.railway.app/api-docs/",
    status: "healthy",
  });
});

// not found path
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({ message: "router not found" });
});

export default app;
