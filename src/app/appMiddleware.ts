import express from "express";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});


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
