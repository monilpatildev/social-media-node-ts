import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { existsSync, promises as fs, mkdirSync } from "fs";
import path, { resolve as pathResolve } from "path";
import { ResponseHandler } from "./responseHandler.util";

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

const UPLOAD_DIR = path.join(__dirname, "../uploads/users-post");

if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const fileStorage = multer.diskStorage({
  destination: async (
    request: Request,
    file: Express.Multer.File,
    callback: DestinationCallback
  ): Promise<void> => {
    try {
      const user = (request as any).userData;
      const userDir = pathResolve(
        __dirname,
        `../uploads/users-post/${user._id}`
      );
      await fs.mkdir(userDir, { recursive: true });

      const postDir = pathResolve(
        __dirname,
        `../uploads/users-post/${user._id}/${
          !request.params.id ? user._id : request.params.id
        }`
      );
      console.log(request.params.id, postDir);
      
      await fs.mkdir(postDir, { recursive: true });
      callback(null, postDir);
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

const upload = multer({
  storage: fileStorage,
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

export const deletePost = (userId: string, idOfPost: string): void => {
  const postDir = pathResolve(
    __dirname,
    `../uploads/users-post/${userId}/${idOfPost}`
  );
  fs.rm(postDir, { recursive: true });
};

export function uploadPostsMiddleware(
  request: Request,
  res: Response,
  next: NextFunction
): any {
  upload.array("posts", 5)(request, res, (error: any) => {
    if (error) {
      console.log(error);
      return ResponseHandler.error(
        res,
        400,
        "Only images (JPG, PNG, WebP, or GIF), up to 5 images."
      );
    }
    const files = request.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return ResponseHandler.error(res, 400, "At least one image is required.");
    }
    next();
  });
}
