import { Router } from "express";
import PostController from "./post.controller";
import AuthMiddleware from "../../middleware/authVerification";
import ImageUploadMiddleware from "../../middleware/ImageUploadMiddleware";
import { ImageType } from "../../common/enums";

const postRoute: Router = Router();

postRoute.post(
  "/",
  AuthMiddleware.authenticate(),
  ImageUploadMiddleware.handleUpload(ImageType.POST, {
    fieldName: "posts",
    maxCount: 5,
  }),
  PostController.createPost
);
postRoute.patch(
  "/:id",
  AuthMiddleware.authenticate(),
  ImageUploadMiddleware.handleUpload(ImageType.POST, {
    fieldName: "posts",
    maxCount: 5,
    isPatch: true,
  }),
  PostController.updatePost
);
postRoute.get("/", AuthMiddleware.authenticate(), PostController.getAllPost);
postRoute.get("/:id", AuthMiddleware.authenticate(), PostController.getPost);
postRoute.get(
  "/post-image/:id",
  AuthMiddleware.authenticate(),
  PostController.getPostImage
);
postRoute.delete(
  "/:id",
  AuthMiddleware.authenticate(),
  PostController.deletePost
);

export default postRoute;
