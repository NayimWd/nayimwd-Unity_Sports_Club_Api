import express, { Request, RequestHandler, Response } from "express";
import appMiddleware from "./appMiddleware";
import router from "../routes";
import setupSwagger from "../config/swagger-config";
import { requestId } from "../utils/requestId";
import { requestLogger } from "../middleware/requestLogger";
import { errorHandler } from "../middleware/errorHandler";

// initialize app
const app = express();

// middleware
app.use(...(appMiddleware as RequestHandler[]));

// setup swagger
setupSwagger(app);

// logger
app.use(requestId);
app.use(requestLogger);

// connect router
app.use(router);

// error handler
app.use(errorHandler);

// not found path
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({ message: "router not found" });
});

export default app;
