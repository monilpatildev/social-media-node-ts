import multer from "multer";
import { Request } from "express";
import { promises as fs, mkdirSync, existsSync } from "fs";
import path, { resolve as pathResolve } from "path";
import { CustomRequest } from "../middleware/authVerification";
import { ImageType } from "../common/enums";

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/jpg",
];
const BASE_UPLOAD_DIR = path.join(__dirname, "../uploads");

if (!existsSync(BASE_UPLOAD_DIR)) {
  mkdirSync(BASE_UPLOAD_DIR, { recursive: true });
}

const createStorage = (type: ImageType) => {
  return multer.diskStorage({
    destination: async (
      request: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void
    ) => {
      try {
        const user = (request as CustomRequest).userData;
        let destDir = "";

        if (type === ImageType.PROFILE) {
          destDir = pathResolve(
            BASE_UPLOAD_DIR,
            `users-profile-picture/${user._id}`
          );
          try {
            await fs.rm(destDir, { recursive: true, force: true });
          } catch (error) {}
        } else {
          const postId = request.params.id || user._id;
          destDir = pathResolve(
            BASE_UPLOAD_DIR,
            `users-post/${user._id}/${postId}`
          );
          if (!(request as any).isFolderCleared) {
            await fs.rm(destDir, { recursive: true, force: true });
            (request as any).isFolderCleared = true;
          }
        }

        await fs.mkdir(destDir, { recursive: true });
        cb(null, destDir);
      } catch (error) {
        cb(error as Error, "");
      }
    },
    filename: (_, file, cb) => cb(null, file.originalname),
  });
};

export const uploader = {
  profile: multer({
    storage: createStorage(ImageType.PROFILE),
    limits: { fileSize: 3 * 1024 * 1024, files: 1 },
    fileFilter: (_, file, cb) =>
      allowedMimeTypes.includes(file.mimetype)
        ? cb(null, true)
        : cb(null, false),
  }),

  post: multer({
    storage: createStorage(ImageType.POST),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_, file, cb) =>
      allowedMimeTypes.includes(file.mimetype)
        ? cb(null, true)
        : cb(new Error("Invalid file type")),
  }),
};

export const updateFileName = (userId: string, postId: string): string => {
  const postDir = pathResolve(
    __dirname,
    `../uploads/users-post/${userId}/${userId}`
  );
  const newPath = pathResolve(
    __dirname,
    `../uploads/users-post/${userId}/${postId}`
  );

  const uploadPath = `uploads/users-post/${userId}/${postId}`;
  fs.rename(postDir, newPath);
  return uploadPath;
};
