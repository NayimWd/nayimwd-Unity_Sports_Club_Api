import pinoHttp from "pino-http";
import { logger } from "../lib/logger";
import { RequestHandler } from "express";

export const requestLogger = pinoHttp({
  logger,

  genReqId: (req) => req.id,

  customLogLevel(req, res, err) {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },

  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        ip: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"],
      };
    },

    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },

  customSuccessMessage(req, res) {
    return `${req.method} ${req.url} completed`;
  },

  customErrorMessage(req, res) {
    return `${req.method} ${req.url} failed`;
  },
}) as RequestHandler;
