import { Request, Response, NextFunction, RequestHandler } from "express";
import { ApiError } from "../utils/ApiError";
import { logger } from "../lib/logger";

interface TimeOutOptions {
  ms?: number;
}

export const timeoutMiddleware = ({
  ms = 15000,
}: TimeOutOptions = {}): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Track Response
    let finished = false;

    //set timer
    const timer = setTimeout(() => {
      if (!finished) {
        finished = true;

        const error = new ApiError(503, `Request Timeout after ${ms} ms`);

        // log timeout msg
        logger.error({
          reqId: req.id,
          method: req.method,
          route: req.originalUrl,
          userId: (req as any).user?.id,
          ip: req.ip,
          message: error.message,
        });

        // send api response
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
    }, ms);

    // cleanup timer
    res.on("finish", () => {
      finished = true;
      clearTimeout(timer);
    });
    next();
  };
};
