import { Router } from "express";
import PostController from "./post.controller";
import AuthMiddleware from "../../middleware/authVerification";

const postRoute = Router();

postRoute.get("/", AuthMiddleware.authenticate, PostController.getAllPosts);
postRoute.post("/", AuthMiddleware.authenticate, PostController.createPost);
postRoute.patch("/:id", AuthMiddleware.authenticate, PostController.updatePost);
postRoute.get("/:id", AuthMiddleware.authenticate, PostController.getPost);
postRoute.delete(
  "/:id",
  AuthMiddleware.authenticate,
  PostController.deleteUser
);

export default postRoute;
