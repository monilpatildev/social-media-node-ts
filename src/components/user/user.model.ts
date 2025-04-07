import { Express } from "express";
import { Request } from "express";
import mongoose, { Document, Model, Schema, Types } from "mongoose";

// declare namespace Express {
//   export interface Request {
//     user?: any;
//   }
// }

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  username: string;
  isDeleted: boolean;
  bio: string;
  profile: string;
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
}

const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
    },
    profile: {
      type: String,
    },
    followers: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    following: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
  },
  { timestamps: true }
);

const UserModel: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default UserModel;
