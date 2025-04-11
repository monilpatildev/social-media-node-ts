import {
  IFilterQuery,
  IGetAllUsers,
  IUploadedFile,
} from "./../../common/interfaces";
import UserDao from "./user.dao";
import { IUser } from "./user.model";
import passwordManager from "../../utils/password.util";
import { isObjectIdOrHexString, Types } from "mongoose";
import addToPipeline from "../../service/pipeline.service";
import path from "path";
import fs from "fs";
import { HttpStatusCode } from "../../common/httpStatusCode";

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
        throw {
          status: HttpStatusCode.BAD_REQUEST,
          message: "Email or username already used",
        };
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
        throw {
          status: HttpStatusCode.INTERNAL_SERVER_ERROR,
          message: "Internal server error",
        };
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
        throw {
          status: HttpStatusCode.INTERNAL_SERVER_ERROR,
          message: "Internal server error",
        };
      }
      return updatedUser;
    } catch (error: any) {
      throw {
        status: error.status || HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: error.message || "Failed to update user",
      };
    }
  };

  public getUser = async (id: string): Promise<IUser[]> => {
    try {
      if (!isObjectIdOrHexString(id)) {
        throw {
          status: HttpStatusCode.BAD_REQUEST,
          message: "Invalid user id",
        };
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
            "following.__v": 0,
            "followers.__v": 0,
          },
        },
      ];

      const userDetails: IUser[] = await this.userDao.getUserByIdOrEmail(
        pipeline
      );

      if (!userDetails.length) {
        throw { status: HttpStatusCode.NOT_FOUND, message: "User not found!" };
      }
      return userDetails;
    } catch (error: any) {
      throw error;
    }
  };

  public getAllUser = async (query: IFilterQuery): Promise<IGetAllUsers> => {
    try {
      const pipeline: any[] = [];

      const queryArray = [query.firstName, query.username];
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
        throw {
          status: HttpStatusCode.BAD_REQUEST,
          message: "Limit cannot be 0",
        };
      }
      if (query.pageNumber === "0") {
        throw {
          status: HttpStatusCode.BAD_REQUEST,
          message: "Page number cannot be 0",
        };
      }
      const pageNumber = parseInt(query.pageNumber || "1", 10);
      const limit = parseInt(query.limit || "10", 10);
      const skip = (pageNumber - 1) * limit;
      const sort = query.sort === "dec" ? -1 : 1;

      pipeline.push({
        $facet: {
          data: [
            { $sort: { username: sort } },
            { $skip: skip },
            { $limit: limit },
          ],
          totalUser: [{ $count: "count" }],
        },
      });

      const result: IGetAllUsers | any = await this.userDao.getAllUsers(
        pipeline
      );

      const users: IUser[] = result[0]?.data || [];
      const totalUsers: number = result[0]?.totalUser[0]?.count || 0;

      if (!users.length) {
        throw { status: HttpStatusCode.NOT_FOUND, message: "User not found!" };
      }

      return { totalUsers, users };
    } catch (error: any) {
      throw error;
    }
  };

  public deleteUser = async (id: string): Promise<IUser> => {
    try {
      const deleteUser = await this.userDao.deleteUserById(id);
      if (!deleteUser) {
        throw { status: HttpStatusCode.NOT_FOUND, message: "User not found!" };
      }
      return deleteUser;
    } catch (error: any) {
      throw error;
    }
  };
}

export default UserService;
