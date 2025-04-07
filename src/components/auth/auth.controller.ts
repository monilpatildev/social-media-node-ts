import { Request, Response } from "express";
import { ResponseHandler } from "../../utils/responseHandler.util";
import { validateEmailPassword } from "../auth/auth.validation";
import UserService from "../user/user.service";
import AuthService from "./auth.service";
import AuthMiddleware from "../../middleware/authVerification";
import { ValidationResult } from "joi";
import { validateUser } from "../user/user.validation";

class AuthController {
  private userService: UserService;
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
    this.userService = new UserService();
  }

  public registerUser = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      const validationResult: ValidationResult<any> = await validateUser(
        request.body
      );
      if (validationResult.error) {
        const errorMessages = validationResult.error.details
          .map((detail) => detail.message)
          .join(", ");
        console.log(errorMessages);
        return ResponseHandler.error(response, 400, errorMessages);
      }

      const newUser = await this.userService.createUser(request.body);
      return ResponseHandler.success(
        response,
        201,
        "user created successfully!",
        newUser
      );
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || 500,
        error.message || "Internal server error"
      );
    }
  };

  public authenticateUser = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      const validationResult: ValidationResult<any> =
        await validateEmailPassword(request.body);
      if (validationResult.error) {
        const errorMessages = validationResult.error.details
          .map((detail) => detail.message)
          .join(", ");
        return ResponseHandler.error(response, 401, errorMessages);
      }

      const { email, password } = request.body;
      const data = await this.authService.authenticateUser(email, password);
      return ResponseHandler.success(
        response,
        200,
        "Authenticated successfully!",
        data
      );
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || 500,
        error.message || "Internal server error"
      );
    }
  };

  public generateRefreshToken = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      const { refreshToken } = request.body;
      if (!refreshToken) {
        return ResponseHandler.error(response, 404, "No token found");
      }

      const data = await this.authService.GenerateRefreshToken(refreshToken);
      return ResponseHandler.success(
        response,
        201,
        "Tokens generated successfully!",
        data
      );
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || 500,
        error.message || "Internal server error"
      );
    }
  };
}

export default new AuthController();
