import { Router } from "express";
import authController from "./auth.controller";
const authRoutes: Router = Router();

authRoutes.post("/signup", authController.registerUser);
authRoutes.post("/signin", authController.authenticateUser);
authRoutes.post("/refresh-token", authController.generateRefreshToken);

export default authRoutes;
