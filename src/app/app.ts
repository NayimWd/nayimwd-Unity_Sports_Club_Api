import express, { Request, Response } from "express";
import appMiddleware from "./appMiddleware";
import router from "../routes";
import setupSwagger from "../config/swagger-config";

// initialize app
const app = express();

// middleware
app.use(...appMiddleware);

// setup swagger
setupSwagger(app);

// connect router
app.use(router)

// not found path
app.use("*", (req: Request, res: Response) => {
     res.status(404).json({ message: "router not found" });
  });

export  {app};