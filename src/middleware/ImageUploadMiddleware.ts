import { NextFunction, Request, RequestHandler, Response } from "express";
import { uploadPosts } from "../utils/multerForPost.util";
import { uploadProfile } from "../utils/multerForProfile.util";
import { ResponseHandler } from "../utils/responseHandler.util";
import multer from "multer";

class ImageUploadMiddleware {
  static uploadProfile: RequestHandler = (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    uploadProfile.single("profile")(request, response, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          let errorMessage = "";
          switch (err.code) {
            case "LIMIT_UNEXPECTED_FILE":
              errorMessage = request.file
                ? "Please upload a single file."
                : "Please use 'profile' as the field name.";
              break;
            default:
              errorMessage = `Multer error: ${err.message}`;
              break;
          }
          return ResponseHandler.error(response, 400, errorMessage);
        }
        return ResponseHandler.error(
          response,
          500,
          "Unknown error occurred during file upload"
        );
      }
      next();
    });
  };

  static uploadPosts: RequestHandler = (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    uploadPosts.array("posts", 5)(request, response, (error: any) => {
      if (error) {
        if (error instanceof multer.MulterError) {
          let errorMessage = "";
          switch (error.code) {
            case "LIMIT_UNEXPECTED_FILE":
              errorMessage = "Maximum of 5 images are allowed.";
              break;
            case "LIMIT_FILE_SIZE":
              errorMessage = "Image size could be 10 mb.";
              break;
            default:
              errorMessage = `Multer error: ${error.message}`;
              break;
          }
          return ResponseHandler.error(response, 400, errorMessage);
        }
        return ResponseHandler.error(
          response,
          400,
          "Only images (JPG, PNG, WebP, or GIF), up to 5 images, are allowed."
        );
      }

      const files = request.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return ResponseHandler.error(
          response,
          400,
          "At least one image is required."
        );
      }

      next();
    });
  };
}

export default ImageUploadMiddleware;
