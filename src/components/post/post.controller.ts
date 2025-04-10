import { Request, Response } from "express";
import { ResponseHandler } from "../../utils/responseHandler.util";
import { validatePost } from "./post.validation";
import PostService from "./post.service";
import { ValidationResult } from "joi";
import { IPost } from "./post.model";

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
        console.log(errorMessages);
        return ResponseHandler.error(response, 400, errorMessages);
      }
      if (!request.files?.length) {
        return ResponseHandler.error(response, 400, "Post image is required");
      }
      await this.postService.createPost(
        request.body,
        (request as any).userData._id,
        (request as any).files
      );
      return ResponseHandler.success(
        response,
        201,
        "Post created successfully!"
      );
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || 500,
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
      if (postValidate.error) {
        const errorMessages = postValidate.error.details
          .map((detail) => detail.message)
          .join(", ");
        console.log(errorMessages);
        return ResponseHandler.error(response, 400, errorMessages);
      }
      if (!request.params.id) {
        return ResponseHandler.error(response, 400, "Post id required");
      }
      const updatedPost: IPost = await this.postService.updatePost(
        request.body,
        (request as any).userData._id,
        request.params.id,
        (request as any).files
      );
      return ResponseHandler.success(
        response,
        200,
        "Post updated successfully!",
        updatedPost
      );
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || 500,
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
        return ResponseHandler.error(response, 400, "Post id required");
      }
      const foundPost: IPost[] = await this.postService.getPost(
        request.params.id,
        (request as any).userData._id
      );
      return ResponseHandler.success(
        response,
        200,
        "Post fetch successFully!",
        foundPost[0]
      );
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || 500,
        error.message || "Internal server error"
      );
    }
  };

  public getAllPost = async (
    request: Request,
    response: Response
  ): Promise<any> => {
    try {
      const foundPost: IPost[]= await this.postService.getAllPost(
        (request as any).userData._id,request.query
      );
      return ResponseHandler.success(
        response,
        200,
        `Posts ${foundPost.length} fetch successFully!`,
        foundPost
      );
    } catch (error: any) {
      return ResponseHandler.error(
        response,
        error.status || 500,
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
        return ResponseHandler.error(response, 400, "Post id required");
      }
      await this.postService.deletePost(
        request.params.id,
        (request as any).userData._id
      );
      return ResponseHandler.success(
        response,
        200,
        "Post deleted successFully!"
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

export default new PostController();
