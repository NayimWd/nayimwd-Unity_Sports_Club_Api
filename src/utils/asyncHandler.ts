import { Request, Response, NextFunction } from "express";
// type define
type RequestHandler = (req: Request, res: Response, next: NextFunction) => any;
// Async handler function
const asyncHandler = (requestHandler: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };