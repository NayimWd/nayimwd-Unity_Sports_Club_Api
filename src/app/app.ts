import express from "express";
import appMiddleware from "./appMiddleware";

// initialize app
const app = express();

// middleware
app.use(...appMiddleware);

export  {app};