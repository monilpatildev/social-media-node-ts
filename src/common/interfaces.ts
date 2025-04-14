import { Response } from "express";
import { IPost } from "../components/post/post.model";
import { IUser } from "../components/user/user.model";
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
  firstName?: string;
  pageNumber?: string;
  limit?: string;
  sort?: string;
}

export interface IFilterPostQuery {
  searchText?: string;
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

export interface IApiResponse {
  status: number;
  success: boolean;
  message: string;
  data?: T;
}

export interface IResponseHandlerStatics {
  success(
    response: Response,
    status: number,
    message: string,
    data?: any
  ): Response<IApiResponse>;
  error(
    response: Response,
    status?: number,
    message?: string
  ): Response<IApiResponse>;
}

export interface IGetAllPosts {
  posts: IPost[] | null;
  totalPost?: number;
}

export interface IGetAllUsers {
  users: IUser[] | null;
  totalUsers: number;
}
export interface IAuthToken {
  _id: string;
  email: string;
  iat: number;
  exp: number;
}
