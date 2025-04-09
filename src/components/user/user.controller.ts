import { Request, Response } from "express";
import { ResponseHandler } from "../../utils/responseHandler.util";
import UserService from "../user/user.service";
import { ValidationResult } from "joi";
import { validateUser } from "./user.validation";
import FollowService from "../follow/follow.service";

class UserController {
  private userService: UserService;
  private followService: FollowService;
  constructor() {
    this.userService = new UserService();
    this.followService = new FollowService();
  }

  public updateUser = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      if (
        (!Object.keys(request.body).length || !request.body) &&
        !request.file
      ) {
        return ResponseHandler.error(response, 400, "No body found!");
      }
      const validationResult: ValidationResult<any> = await validateUser(
        request.body,
        true
      );

      if (validationResult.error) {
        const errorMessages = validationResult.error.details
          .map((detail) => detail.message)
          .join(", ");
        console.log(errorMessages);
        return ResponseHandler.error(response, 400, errorMessages);
      }

      const newUser = await this.userService.updateUser(
        request.body,
        (request as any).userData,
        request.file
      );
      return ResponseHandler.success(
        response,
        200,
        "Your profile updated successfully!",
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

  public deleteUser = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      const foundUser = await this.userService.deleteUser(request.params.id);
      return ResponseHandler.success(
        response,
        200,
        "Account deleted successFully!"
      );
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || 500,
        error.message || "internal server error"
      );
    }
  };

  public getUser = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      const foundUser = await this.userService.getUser(request.params.id);
      return ResponseHandler.success(
        response,
        200,
        "User fetch successFully!",
        foundUser[0]
      );
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || 500,
        error.message || "internal server error"
      );
    }
  };

  public getLoggedUser = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      const foundUser = await this.userService.getUser(
        (request as any).userData._id
      );
      return ResponseHandler.success(
        response,
        200,
        "Profile fetch successFully!",
        foundUser[0]
      );
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || 500,
        error.message || "internal server error"
      );
    }
  };

  public getAllUsers = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      const allUsers = await this.userService.getAllUser(request.query);
      return ResponseHandler.success(
        response,
        200,
        `Fetch ${allUsers.length} users`,
        allUsers
      );
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || 500,
        error.message || "internal server error"
      );
    }
  };

  public followUser = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      if (request.params.id) {
        return ResponseHandler.error(response, 400, "User id required");
      }
      const foundUserStatus = await this.followService.followUser(
        (request as any).userData._id,
        request.body.id
      );
      const resMessage =
        foundUserStatus === "pending"
          ? "Sent follow request successFully!"
          : "Followed successFully!";
      return ResponseHandler.success(response, 200, resMessage);
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || 500,
        error.message || "internal server error"
      );
    }
  };
  public unfollowUser = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      if (request.params.id) {
        return ResponseHandler.error(response, 400, "User id required");
      }
      const foundUser = await this.followService.unfollowUser(
        (request as any).userData._id,
        request.body.id
      );
      return ResponseHandler.success(response, 200, "Unfollow successFully!");
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || 500,
        error.message || "internal server error"
      );
    }
  };

  public getFollowRequests = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      const foundUser = await this.followService.getRequest(
        (request as any).userData._id
      );
      return ResponseHandler.success(
        response,
        200,
        "Fetch requests successFully!",
        foundUser
      );
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || 500,
        error.message || "internal server error"
      );
    }
  };

  public acceptFollowRequest = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      if (request.params.id) {
        return ResponseHandler.error(response, 400, "User id required");
      }
      const foundUser = await this.followService.acceptRequest(
        (request as any).userData._id,
        request.body.id
      );
      return ResponseHandler.success(response, 200, "Followed successFully!");
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || 500,
        error.message || "internal server error"
      );
    }
  };
}

export default new UserController();
