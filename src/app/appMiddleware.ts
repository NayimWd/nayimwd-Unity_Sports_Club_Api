import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 300, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: "draft-7",
    legacyHeaders: false,
  });

  const allowedOrigins = process.env.CORS_ORIGIN?.split(",");

const appMiddleware = [
    express.json({
        limit: "160kb",
    }),
    express.static("public"),
    express.urlencoded({extended: true, limit: "160kb"}),
    cookieParser(),
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins?.includes(origin)) {
              return callback(null, true);
            } else {
              return callback(new Error("Not allowed by CORS"));
            }
          },
        credentials: true
    }),
    helmet(),
    hpp(),
    limiter
];

export default appMiddleware;