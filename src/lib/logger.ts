import pino from "pino";
import path from "path";
import {createStream} from "rotating-file-stream";

const isDev = process.env.NODE_ENV !== "production";

const logDir = path.join(process.cwd(), "logs");

// if file size become 5 mb rotate file
const stream = createStream("app.log", {
  size: "3M",
  interval: "1d",
  compress: "gzip",
  maxFiles: 6,
  path: logDir,
});

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",

    base: {
      service: "sports-club-api",
      env: process.env.NODE_ENV,
    },

    transport: isDev
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  },
  isDev ? undefined : stream
);
