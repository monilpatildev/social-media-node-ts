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