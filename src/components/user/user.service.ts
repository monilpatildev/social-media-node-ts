import { IFilterQuery, IUploadedFile } from "./../../common/interfaces";
import UserDao from "./user.dao";
import { IUser } from "./user.model";
import passwordManager from "../../utils/password.util";
import { isObjectIdOrHexString, Types } from "mongoose";
import addToPipeline from "../../service/pipeline.service";
import path from "path";
import fs from "fs";

class UserService {
  private userDao: UserDao;

  constructor() {
    this.userDao = new UserDao();
  }

  public createUser = async (userData: IUser): Promise<IUser> => {
    try {
      const pipeline: any[] = [
        {
          $match: {
            $or: [{ email: userData.email }, { username: userData.username }],
          },
        },
      ];
      const existUser: IUser[] = await this.userDao.getUserByIdOrEmail(
        pipeline
      );
      if (existUser.length) {
        throw { status: 400, message: "Email or username already used" };
      }
      const { firstName, lastName, email, password, username } = userData;
      const hashedPassword: string = await passwordManager.hashPassword(
        password
      );
      const user = {
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword,
      } as IUser;
      const createUser: IUser = await this.userDao.createUser(user);
      if (!createUser) {
        throw { status: 500, message: "Internal server error" };
      }
      return createUser;
    } catch (error: any) {
      throw error;
    }
  };

  public updateUser = async (
    userData: IUser,
    userId: string,
    file?: IUploadedFile
  ): Promise<IUser> => {
    try {
      if (file) {
        const userDir: string = path.resolve(
          __dirname,
          "../../uploads/users-profile-picture",
          userId
        );
        const filePath = path.join(userDir, file.originalname);

        if (file.path !== filePath) {
          fs.renameSync(file.path, filePath);
        }
        userData.profile = filePath;
      }

      const updatedUser: IUser | null = await this.userDao.updateUserById(
        userId,
        userData
      );
      if (!updatedUser) {
        throw { status: 500, message: "Internal server error" };
      }
      return updatedUser;
    } catch (error: any) {
      throw {
        status: error.status || 500,
        message: error.message || "Failed to update user",
      };
    }
  };

  public getUser = async (id: string): Promise<IUser[]> => {
    try {
      if (!isObjectIdOrHexString(id)) {
        throw { status: 400, message: "Invalid user id" };
      }

      const pipeline: any[] = [
        {
          $match: { _id: new Types.ObjectId(id), isDeleted: false },
        },
        {
          $lookup: {
            from: "follows",
            localField: "_id",
            foreignField: "userId",
            as: "following",
          },
        },
        {
          $lookup: {
            from: "follows",
            localField: "_id",
            foreignField: "followingId",
            as: "followers",
          },
        },
        {
          $addFields: {
            totalFollowing: { $size: "$following" },
            totalFollowers: { $size: "$followers" },
          },
        },
        {
          $project: {
            __v: 0,
            isDeleted: 0,
            password: 0,
            createdAt: 0,
            updatedAt: 0,
            "following.requested": 0,
            "following.createdAt": 0,
            "following.updatedAt": 0,
            "following.__v": 0,
            "followers.requested": 0,
            "followers.createdAt": 0,
            "followers.updatedAt": 0,
            "followers.__v": 0,
          },
        },
      ];

      const userDetails: IUser[] = await this.userDao.getUserByIdOrEmail(
        pipeline
      );

      if (!userDetails.length) {
        throw { status: 404, message: "User not found!" };
      }
      return userDetails;
    } catch (error: any) {
      throw error;
    }
  };

  public getAllUser = async (query: IFilterQuery): Promise<IUser[]> => {
    try {
      const pipeline: any[] = [];

      const queryArray = [query.name, query.username];
      const fieldsArray = ["firstName", "username"];

      pipeline.push(addToPipeline(queryArray, fieldsArray));

      pipeline.push({
        $project: {
          __v: 0,
          isDeleted: 0,
          password: 0,
          updatedAt: 0,
          createdAt: 0,
        },
      });
      if (query.limit === "0") {
        throw { status: 400, message: "Limit cannot be 0" };
      }
      if (query.pageNumber === "0") {
        throw { status: 400, message: "Page number cannot be 0" };
      }
      const pageNumber = parseInt(query.pageNumber || "1", 10);
      const limit = parseInt(query.limit || "10", 10);
      const skip = (pageNumber - 1) * limit;
      // const sort = isObjectIdOrHexString
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });
      // pipeline.push({ $sort: { createdAt: sort } });

      const userDetails: IUser[] = await this.userDao.getUserByIdOrEmail(
        pipeline
      );

      if (!userDetails.length) {
        throw { status: 404, message: "User not found!" };
      }
      return userDetails;
    } catch (error: any) {
      throw error;
    }
  };

  public deleteUser = async (id: string): Promise<IUser> => {
    try {
      const deleteUser = await this.userDao.deleteUserById(id);
      if (!deleteUser) {
        throw { status: 404, message: "User not found!" };
      }
      return deleteUser;
    } catch (error: any) {
      throw error;
    }
  };
}

export default UserService;
