import multer, { StorageEngine } from "multer";
import { Request } from "express";
import { Callback } from "mongoose";
import path from "path";

const storage: StorageEngine = multer.diskStorage({
  destination: function (
    req: Request,
    file: Express.Multer.File,
    cb: Callback
  ) {
    const uploadPath = path.join(__dirname, "../../public/temp");
    cb(null, uploadPath);
  },
  filename: function (req: Request, file: Express.Multer.File, cb: Callback) {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage,
});
