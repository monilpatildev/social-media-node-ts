import { Router } from "express";
import UserController from "./user.controller";
import AuthMiddleware from "../../middleware/authVerification";
import ImageUploadMiddleware from "../../middleware/ImageUploadMiddleware";
import { ImageType } from "../../common/enums";


const userRoute: Router = Router();

userRoute.get("/", AuthMiddleware.authenticate(), UserController.getAllUsers);
userRoute.patch(
  "/profile",
  AuthMiddleware.authenticate(),
  ImageUploadMiddleware.handleUpload( ImageType.PROFILE, { fieldName: "profile", isPatch: true }),
  UserController.updateUser
);
userRoute.get(
  "/profile",
  AuthMiddleware.authenticate(),
  UserController.getLoggedUser
);
userRoute.get(
  "/profile/:id",
  AuthMiddleware.authenticate(),
  UserController.getUser
);
userRoute.delete(
  "/:id",
  AuthMiddleware.authenticate(),
  UserController.deleteUser
);

userRoute.post(
  "/follow",
  AuthMiddleware.authenticate(),
  UserController.followUser
);

userRoute.post(
  "/unfollow",
  AuthMiddleware.authenticate(),
  UserController.unfollowUser
);

userRoute.get(
  "/get-requests",
  AuthMiddleware.authenticate(),
  UserController.getFollowRequests
);

userRoute.post(
  "/accept-request",
  AuthMiddleware.authenticate(),
  UserController.acceptFollowRequest
);

export default userRoute;
