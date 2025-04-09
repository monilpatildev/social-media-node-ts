import { uploadPosts } from "../utils/multerForPost.util";
import { uploadProfile } from "../utils/multerForProfile.util";
import { ResponseHandler } from "../utils/responseHandler.util";

class ImageUploadMiddleware {
  static uploadProfile(
    request: Request,
    response: Response,
    next: NextFunction
  ): any  {
    try {
      uploadProfile.single("profile")(request, response, function (error) {
        if (error) {
          return ResponseHandler.error(
            response,
            400,
            "Only a single image (JPG, PNG, WebP, or GIF) and max 3 mb size is allowed."
          );
        }

        next();
      });
    } catch (error) {
      return ResponseHandler.error(response, 500, "Internal server error");
    }
  }

  static uploadPosts(
    request: Request,
    response: Response,
    next: NextFunction
  ): any {
    uploadPosts.array("posts", 5)(request, response, (error: any) => {
      if (error) {
        console.log(error);
        return ResponseHandler.error(
          response,
          400,
          "Only images (JPG, PNG, WebP, or GIF), up to 5 images."
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
  }
}

export default ImageUploadMiddleware;
