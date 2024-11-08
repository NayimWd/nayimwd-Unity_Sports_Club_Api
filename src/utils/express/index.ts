import 'express-serve-static-core';
import 'multer'; // Import Multer types
import { IUser } from '../types/SchemaTypes';

declare global {
  namespace Express {
    interface Request {
      files?: {
        [fieldname: string]: Multer.File[]; // Use Multer's built-in File type
      } | Multer.File[];
      user?: IUser; // Define user property as IUser
    }
  }
}