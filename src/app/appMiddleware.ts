import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
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

const allowedOrigins = process.env.CORS_ORIGIN?.split(",");

const appMiddleware = [
  express.json({
    limit: "160kb",
  }),
  express.static("public"),
  express.urlencoded({ extended: true, limit: "160kb" }),
  cookieParser(),
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
  helmet(),
  hpp(),
  limiter,
];

export default appMiddleware;
