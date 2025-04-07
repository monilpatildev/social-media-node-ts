import { Router } from "express";
import UserController from "./user.controller";
import AuthMiddleware from "../../middleware/authVerification";
// import upload from "../../utils/multer.util";

const userRoute = Router();

userRoute.get("/", AuthMiddleware.authenticate, UserController.getAllUsers);
userRoute.patch(
  "/:id",
  AuthMiddleware.authenticate,
  // upload.single("profile"),
  UserController.updateUser
);
userRoute.get(
  "/profile",
  AuthMiddleware.authenticate,
  UserController.getLoggedUser
);
userRoute.get(
  "/profile/:id",
  AuthMiddleware.authenticate,
  UserController.getUser
);
userRoute.delete(
  "/:id",
  AuthMiddleware.authenticate,
  UserController.deleteUser
);

export default userRoute;
