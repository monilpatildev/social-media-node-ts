import { Request } from "express";
import multer from "multer";
import { existsSync, promises as fs, mkdirSync } from "fs";
import path, { resolve as pathResolve } from "path";
import { ResponseHandler } from "./responseHandler.util";
import { CustomRequest } from "../middleware/authVerification";

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

const UPLOAD_DIR = path.join(__dirname, "../uploads");

if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const fileStorage = multer.diskStorage({
  destination: async (
    request: Request,
    file: Express.Multer.File,
    callback: DestinationCallback
  ): Promise<void> => {
    try {
      const user = (request as CustomRequest).userData;
      const userDir = pathResolve(
        __dirname,
        `../uploads/users-profile-picture/${user._id}`
      );
      try {
        await fs.access(userDir);
        await fs.rm(userDir, { recursive: true });
      } catch (error) {}
      await fs.mkdir(userDir, { recursive: true });
      callback(null, userDir);
    } catch (error) {
      callback(error as Error, "Error");
      throw error;
    }
  },

  filename: (
    request: Request,
    file: Express.Multer.File,
    callback: FileNameCallback
  ): void => {
    callback(null, file.originalname);
  },
});

export const uploadProfile = multer({
  storage: fileStorage,
  limits: { files: 1, fileSize: 3 * 1024 * 1024 },
  fileFilter: (request, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(null, false);
    }
    cb(null, true);
  },
});
