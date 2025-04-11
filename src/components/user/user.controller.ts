import { Request, Response } from "express";
import { ResponseHandler } from "../../utils/responseHandler.util";
import UserService from "../user/user.service";
import { ValidationResult } from "joi";
import { validateUser } from "./user.validation";
import FollowService from "../follow/follow.service";
import { Status } from "../../common/enums";
import { HttpStatusCode } from "../../common/httpStatusCode";
import { CustomRequest } from "../../middleware/authVerification";

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
        return ResponseHandler.error(
          response,
          HttpStatusCode.BAD_REQUEST,
          "No body found!"
        );
      }
      const validationResult: ValidationResult = await validateUser(
        request.body,
        true
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

      const newUser = await this.userService.updateUser(
        request.body,
        (request as CustomRequest).userData._id,
        request.file
      );
      return ResponseHandler.success(
        response,
        HttpStatusCode.OK,
        "Your profile updated successfully!",
        newUser
      );
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || HttpStatusCode.INTERNAL_SERVER_ERROR,
        error.message || "Internal server error"
      );
    }
  };

  public deleteUser = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      await this.userService.deleteUser(
        (request as CustomRequest).userData._id
      );
      return ResponseHandler.success(
        response,
        HttpStatusCode.OK,
        "Account deleted successFully!"
      );
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || HttpStatusCode.INTERNAL_SERVER_ERROR,
        error.message || "internal server error"
      );
    }
  };

  public getUser = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      console.log(request.params.id);

      if (!request.params.id) {
        return ResponseHandler.error(
          response,
          HttpStatusCode.BAD_REQUEST,
          "User id required"
        );
      }
      const foundUser = await this.userService.getUser(request.params.id);
      return ResponseHandler.success(
        response,
        HttpStatusCode.OK,
        "User fetch successFully!",
        foundUser[0]
      );
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || HttpStatusCode.INTERNAL_SERVER_ERROR,
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
        (request as CustomRequest).userData._id
      );
      return ResponseHandler.success(
        response,
        HttpStatusCode.OK,
        "Profile fetch successFully!",
        foundUser[0]
      );
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || HttpStatusCode.INTERNAL_SERVER_ERROR,
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
        HttpStatusCode.OK,
        `Fetch users successfully!`,
        allUsers
      );
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || HttpStatusCode.INTERNAL_SERVER_ERROR,
        error.message || "internal server error"
      );
    }
  };

  public followUser = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      if (!request.body.id) {
        return ResponseHandler.error(
          response,
          HttpStatusCode.BAD_REQUEST,
          "User id required"
        );
      }
      const foundUserStatus: string = await this.followService.followUser(
        (request as CustomRequest).userData._id,
        request.body.id
      );
      const resMessage =
        foundUserStatus === Status.PENDING
          ? "Sent follow request successFully!"
          : "Followed successFully!";
      return ResponseHandler.success(response, HttpStatusCode.OK, resMessage);
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || HttpStatusCode.INTERNAL_SERVER_ERROR,
        error.message || "internal server error"
      );
    }
  };

  public unfollowUser = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      if (!request.body.id) {
        return ResponseHandler.error(
          response,
          HttpStatusCode.BAD_REQUEST,
          "User id required"
        );
      }
      await this.followService.unfollowUser(
        (request as CustomRequest).userData._id,
        request.body.id
      );
      return ResponseHandler.success(
        response,
        HttpStatusCode.OK,
        "Unfollow successFully!"
      );
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || HttpStatusCode.INTERNAL_SERVER_ERROR,
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
        (request as CustomRequest).userData._id
      );
      return ResponseHandler.success(
        response,
        HttpStatusCode.OK,
        "Fetch requests successFully!",
        foundUser
      );
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || HttpStatusCode.INTERNAL_SERVER_ERROR,
        error.message || "internal server error"
      );
    }
  };

  public acceptFollowRequest = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      if (!request.body.id) {
        return ResponseHandler.error(
          response,
          HttpStatusCode.BAD_REQUEST,
          "User id required"
        );
      }
      await this.followService.acceptRequest(
        (request as CustomRequest).userData._id,
        request.body.id
      );
      return ResponseHandler.success(
        response,
        HttpStatusCode.OK,
        "Request accepted successFully!"
      );
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || HttpStatusCode.INTERNAL_SERVER_ERROR,
        error.message || "internal server error"
      );
    }
  };
}

export default new UserController();
