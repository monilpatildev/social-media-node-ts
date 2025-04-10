import { Router } from "express";
import PostController from "./post.controller";
import AuthMiddleware from "../../middleware/authVerification";
import ImageUploadMiddleware from "../../middleware/ImageUploadMiddleware";

const postRoute: Router = Router();

postRoute.post(
  "/",
  AuthMiddleware.authenticate,
  ImageUploadMiddleware.uploadPosts,
  PostController.createPost
);
postRoute.patch(
  "/:id",
  AuthMiddleware.authenticate,
  ImageUploadMiddleware.uploadPosts,
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
