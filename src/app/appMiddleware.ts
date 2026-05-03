import express from "express";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import dotenv from "dotenv";

dotenv.config();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const appMiddleware = [
  express.json({
    limit: "160kb",
  }),
  express.static("public"),
  express.urlencoded({ extended: true, limit: "160kb" }),
  cookieParser(),
  helmet({ contentSecurityPolicy: false }),
  hpp(),
  limiter,
];

export default appMiddleware;
