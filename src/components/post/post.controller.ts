import { Request, Response } from "express";
import { ResponseHandler } from "../../utils/responseHandler.util";
import { validatePost } from "./post.validation";
import PostService from "./post.service";
import { ValidationResult } from "joi";
import { IPost } from "./post.model";
import { IGetAllPosts } from "../../common/interfaces";
import { HttpStatusCode } from "../../common/httpStatusCode";

class PostController {
  private postService: PostService;

  constructor() {
    this.postService = new PostService();
  }

  public createPost = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      const postValidate: ValidationResult = validatePost(request.body);
      if (postValidate.error) {
        const errorMessages = postValidate.error.details
          .map((detail) => detail.message)
          .join(", ");
        return ResponseHandler.error(
          response,
          HttpStatusCode.BAD_REQUEST,
          errorMessages
        );
      }
      if (!request.files?.length) {
        return ResponseHandler.error(
          response,
          HttpStatusCode.BAD_REQUEST,
          "Post image is required"
        );
      }
      await this.postService.createPost(
        request.body,
        (request as any).userData._id,
        (request as any).files
      );
      return ResponseHandler.success(
        response,
        HttpStatusCode.CREATED,
        "Post created successfully!"
      );
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || HttpStatusCode.INTERNAL_SERVER_ERROR,
        error.message || "Internal server error"
      );
    }
  };

  public updatePost = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      const postValidate: ValidationResult = validatePost(request.body, true);
      if (!request.params.id) {
        return ResponseHandler.error(
          response,
          HttpStatusCode.BAD_REQUEST,
          "Post id required"
        );
      }
      if (!request.body) {
        return ResponseHandler.error(
          response,
          HttpStatusCode.BAD_REQUEST,
          "You provide nothing to update!"
        );
      }
      if (postValidate.error) {
        const errorMessages = postValidate.error.details
          .map((detail) => detail.message)
          .join(", ");
        return ResponseHandler.error(
          response,
          HttpStatusCode.BAD_REQUEST,
          errorMessages
        );
      }

      const updatedPost: IPost = await this.postService.updatePost(
        request.body,
        (request as any).userData._id,
        request.params.id,
        (request as any).files
      );
      return ResponseHandler.success(
        response,
        HttpStatusCode.OK,
        "Post updated successfully!",
        updatedPost
      );
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || HttpStatusCode.INTERNAL_SERVER_ERROR,
        error.message || "Internal server error"
      );
    }
  };

  public getPost = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      if (!request.params.id) {
        return ResponseHandler.error(
          response,
          HttpStatusCode.BAD_REQUEST,
          "Post id required"
        );
      }
      const foundPost: IPost[] = await this.postService.getPost(
        request.params.id,
        (request as any).userData._id
      );
      return ResponseHandler.success(
        response,
        HttpStatusCode.OK,
        "Post fetch successFully!",
        foundPost[0]
      );
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || HttpStatusCode.INTERNAL_SERVER_ERROR,
        error.message || "Internal server error"
      );
    }
  };

  public getAllPost = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      const foundPost: IGetAllPosts = await this.postService.getAllPost(
        (request as any).userData._id,
        request.query
      );
      return ResponseHandler.success(
        response,
        HttpStatusCode.OK,
        `Posts fetch successFully!`,
        foundPost
      );
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || HttpStatusCode.INTERNAL_SERVER_ERROR,
        error.message || "Internal server error"
      );
    }
  };

  public deletePost = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      if (!request.params.id) {
        return ResponseHandler.error(
          response,
          HttpStatusCode.BAD_REQUEST,
          "Post id required"
        );
      }
      await this.postService.deletePost(
        request.params.id,
        (request as any).userData._id
      );
      return ResponseHandler.success(
        response,
        HttpStatusCode.OK,
        "Post deleted successFully!"
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

export default new PostController();
