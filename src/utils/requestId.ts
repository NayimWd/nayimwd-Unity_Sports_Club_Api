import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express"

declare module "express-serve-static-core" {
  interface Request {
    id?: string;
  }
};

export function requestId(req: Request, res: Response, next: NextFunction) {
  req.id = randomUUID()
  res.setHeader("x-request-id", req.id)
  next()
};