import { NextFunction, Request, Response, RequestHandler } from "express";
import { ResponseHandler } from "../utils/responseHandler.util";
import { HttpStatusCode } from "../common/httpStatusCode";
import multer from "multer";
import { uploader } from "../utils/uploadImage.util";
import { ImageType } from "../common/enums";

class ImageUploadMiddleware {
  static handleUpload =
    (
      type: ImageType,
      options?: { fieldName?: string; maxCount?: number; isPatch?: boolean }
    ): RequestHandler =>
    (request: Request, response: Response, next: NextFunction) => {
      const { fieldName = type, maxCount = 5, isPatch = false } = options || {};
      const uploadFn =
        type === ImageType.PROFILE
          ? uploader.profile.single(fieldName)
          : uploader.post.array(fieldName, maxCount);

      uploadFn(request, response, (error: any) => {
        if (error) {
          if (error instanceof multer.MulterError) {
            let message = "";
            switch (error.code) {
              case "LIMIT_UNEXPECTED_FILE":
                message = `use 'posts' as field name and you can upload max 5 images`;

                break;
              case "LIMIT_FILE_SIZE":
                message =
                  type === ImageType.PROFILE
                    ? "Profile picture must be under 3 MB."
                    : "Each post image must be under 10 MB.";
                break;
              default:
                message = `${error.message}`;
            }
            return ResponseHandler.error(
              response,
              HttpStatusCode.BAD_REQUEST,
              message
            );
          }
          return ResponseHandler.error(
            response,
            HttpStatusCode.BAD_REQUEST,
            `Invalid file upload: ${error.message}`
          );
        }

        if (type === ImageType.POST) {
          const files = request.files as Express.Multer.File[];
          if ((!files || !files.length) && !isPatch) {
            return ResponseHandler.error(
              response,
              HttpStatusCode.BAD_REQUEST,
              "At least one image is required."
            );
          }
          if (files) {
            const fileNamesSet = new Set<string>();
            for (const file of files) {
              if (fileNamesSet.has(file.originalname)) {
                return ResponseHandler.error(
                  response,
                  HttpStatusCode.BAD_REQUEST,
                  "Duplicate image names are not allowed."
                );
              }
              fileNamesSet.add(file.originalname);
            }
          }
        }

        next();
      });
    };
}

export default ImageUploadMiddleware;
