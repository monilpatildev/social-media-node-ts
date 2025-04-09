import { Router } from "express";
import PostController from "./post.controller";
import AuthMiddleware from "../../middleware/authVerification";
import { uploadPostsMiddleware } from "../../utils/multerForPost.util";
import ImageUploadMiddleware from "../../middleware/ImageUploadMiddleware";

const postRoute = Router();

postRoute.post(
  "/",
  AuthMiddleware.authenticate,
  ImageUploadMiddleware.uploadPosts,
  PostController.createPost
);
postRoute.patch(
  "/:id",
  AuthMiddleware.authenticate,
  uploadPostsMiddleware,
  PostController.updatePost
);
postRoute.get("/", AuthMiddleware.authenticate, PostController.getAllPost);
postRoute.get("/:id", AuthMiddleware.authenticate, PostController.getPost);
postRoute.delete(
  "/:id",
  AuthMiddleware.authenticate,
  PostController.deletePost
);

export default postRoute;
