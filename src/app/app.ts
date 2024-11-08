import express, { Request, Response } from "express";
import appMiddleware from "./appMiddleware";
import router from "../routes";

// initialize app
const app = express();

// middleware
app.use(...appMiddleware);

// connect router
app.use(router)

// not found path
app.use("*", (req: Request, res: Response) => {
     res.status(404).json({ message: "router not found" });
  });

export  {app};