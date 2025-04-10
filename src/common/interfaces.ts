import { Types } from "mongoose";
import { Status } from "./enums";

export interface IUploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

export interface IFollowQuery {
  userId: Types.ObjectId;
  followingId: Types.ObjectId;
  status?: Status;
}

export interface IFilterQuery {
  username?: string;
  name?: string;
  pageNumber?: string;
  limit?: string;
  sort?: string;
}

export interface IFilterPostQuery {
  title?: string;
  pageNumber?: string;
  limit?: string;
  sort?: string;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthenticateQuery {
  password: string;
  email: string;
}

export interface IApiResponse<T = any> {
  status: number;
  success: boolean;
  message: string;
  data?: T;
}

import { Response } from "express";

export interface IResponseHandlerStatics {
  success(
    response: Response,
    status: number,
    message: string,
    data?: any
  ): Response<IApiResponse<any>>;
  error(
    response: Response,
    status?: number,
    message?: string
  ): Response<IApiResponse<any>>;
}
