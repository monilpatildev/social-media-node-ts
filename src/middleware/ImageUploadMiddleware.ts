import { NextFunction, Request, RequestHandler, Response } from "express";
import { uploadPosts } from "../utils/multerForPost.util";
import { uploadProfile } from "../utils/multerForProfile.util";
import { ResponseHandler } from "../utils/responseHandler.util";
import multer from "multer";
import { HttpStatusCode } from "../common/httpStatusCode";

class ImageUploadMiddleware {
  static uploadProfile = (isPatch: boolean = false): RequestHandler => {
    return (request: Request, response: Response, next: NextFunction) => {
      uploadProfile.single("profile")(request, response, (error: any) => {
        if (error) {
          if (error instanceof multer.MulterError) {
            let errorMessage = "";
            switch (error.code) {
              case "LIMIT_UNEXPECTED_FILE":
                errorMessage = request.file
                  ? "Please upload a single file."
                  : "Please use 'profile' as the field name.";
                break;
              default:
                errorMessage = `Multer error: ${error.message}`;
                break;
            }
            return ResponseHandler.error(
              response,
              HttpStatusCode.BAD_REQUEST,
              errorMessage
            );
          }
          return ResponseHandler.error(
            response,
            HttpStatusCode.INTERNAL_SERVER_ERROR,
            "Unknown error occurred during file upload"
          );
        }
        next();
      });
    };
  };
  static uploadPosts = (isPatch: boolean = false): RequestHandler => {
    return (request: Request, response: Response, next: NextFunction): void => {
      uploadPosts.array("posts", 5)(request, response, (error: any) => {
        if (error) {
          if (error instanceof multer.MulterError) {
            let errorMessage = "";
            switch (error.code) {
              case "LIMIT_UNEXPECTED_FILE":
                errorMessage = "Please use 'posts' as the field name.";
                break;
              case "LIMIT_FILE_SIZE":
                errorMessage = "Image size could be 10 mb.";
                break;
              default:
                errorMessage = `Multer error: ${error.message}`;
                break;
            }
            return ResponseHandler.error(
              response,
              HttpStatusCode.BAD_REQUEST,
              errorMessage
            );
          }
          return ResponseHandler.error(
            response,
            HttpStatusCode.BAD_REQUEST,
            "Only images (JPG, PNG, WebP, or GIF), up to 5 images, are allowed."
          );
        }

        const files = request.files as Express.Multer.File[];
        if ((!files || !files.length) && !isPatch) {
          return ResponseHandler.error(
            response,
            HttpStatusCode.BAD_REQUEST,
            "At least one image is required."
          );
        }

        next();
      });
    };
  };
}

export default ImageUploadMiddleware;
