import { Response } from "express";
import { IApiResponse } from "../common/interfaces";

export class ResponseHandler {
  static success(
    response: Response,
    status: number,
    message: string,
    data?: any
  ): Response<IApiResponse<any>> {
    return response.status(status).json({
      status,
      success: true,
      message,
      data,
    });
  }

  static error(
    response: Response,
    status: number = 500,
    message: string = "Internal server error."
  ): Response<IApiResponse<any>> {
    return response.status(status).json({
      status,
      success: false,
      message,
    });
  }
}
