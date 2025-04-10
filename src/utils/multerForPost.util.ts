import { Request } from "express";
import multer from "multer";
import { existsSync, promises as fs, mkdirSync } from "fs";
import path, { resolve as pathResolve } from "path";
import { ResponseHandler } from "./responseHandler.util";
import { CustomRequest } from "../middleware/authVerification";

interface MulterRequest extends Request {
  isFolderCleared?: boolean;
}

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

const UPLOAD_DIR: string = path.join(__dirname, "../uploads/users-post");

if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const fileStorage = multer.diskStorage({
  destination: async (
    request: MulterRequest,
    file: Express.Multer.File,
    callback: DestinationCallback
  ): Promise<void> => {
    try {
      const user = (request as CustomRequest).userData;

      if (request.params.id) {
        const postDir = pathResolve(
          __dirname,
          `../uploads/users-post/${user._id}/${request.params.id}`
        );
        if (!request.isFolderCleared) {
          await fs.rm(postDir, { recursive: true, force: true });
          await fs.mkdir(postDir, { recursive: true });
          request.isFolderCleared = true;
        }
        callback(null, postDir);
      } else {
        const postDir = pathResolve(
          __dirname,
          `../uploads/users-post/${user._id}/${user._id}`
        );
        await fs.mkdir(postDir, { recursive: true });
        callback(null, postDir);
      }
    } catch (error) {
      callback(error as Error, "");
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

export const uploadPosts = multer({
  storage: fileStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (request, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"));
    }
    cb(null, true);
  },
});

export const updateFileName = (userId: string, postId: string): string => {
  const postDir = pathResolve(
    __dirname,
    `../uploads/users-post/${userId}/${userId}`
  );
  const newPath = pathResolve(
    __dirname,
    `../uploads/users-post/${userId}/${postId}`
  );
  fs.rename(postDir, newPath);
  return newPath;
};
