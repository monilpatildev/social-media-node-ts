import { Request, Response } from "express";
import { ResponseHandler } from "../../utils/responseHandler.util";
import { validateEmailPassword } from "../auth/auth.validation";
import UserService from "../user/user.service";
import AuthService from "./auth.service";
import { ValidationResult } from "joi";
import { validateUser } from "../user/user.validation";
import { HttpStatusCode } from "../../common/httpStatusCode";

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
      const validationResult: ValidationResult = await validateUser(
        request.body
      );
      if (validationResult.error) {
        const errorMessages = validationResult.error.details
          .map((detail) => detail.message)
          .join(", ");
        return ResponseHandler.error(
          response,
          HttpStatusCode.BAD_REQUEST,
          errorMessages
        );
      }

      await this.userService.createUser(request.body);
      return ResponseHandler.success(
        response,
        HttpStatusCode.CREATED,
        "user created successfully!"
      );
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || HttpStatusCode.INTERNAL_SERVER_ERROR,
        error.message || "Internal server error"
      );
    }
  };

  public authenticateUser = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      const validationResult: ValidationResult = await validateEmailPassword(
        request.body
      );
      if (validationResult.error) {
        const errorMessages = validationResult.error.details
          .map((detail) => detail.message)
          .join(", ");
        return ResponseHandler.error(
          response,
          HttpStatusCode.UNAUTHORIZED,
          errorMessages
        );
      }

      const { email, password } = request.body;
      const data = await this.authService.authenticateUser(email, password);
      return ResponseHandler.success(
        response,
        HttpStatusCode.OK,
        "Authenticated successfully!",
        data
      );
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || HttpStatusCode.INTERNAL_SERVER_ERROR,
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
        return ResponseHandler.error(
          response,
          HttpStatusCode.NOT_FOUND,
          "No token found"
        );
      }

      const data = await this.authService.GenerateRefreshToken(refreshToken);
      return ResponseHandler.success(
        response,
        HttpStatusCode.CREATED,
        "Tokens generated successfully!",
        data
      );
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || HttpStatusCode.INTERNAL_SERVER_ERROR,
        error.message || "Internal server error"
      );
    }
  };
}

export default new AuthController();
