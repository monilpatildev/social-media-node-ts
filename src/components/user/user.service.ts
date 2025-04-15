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
import { Status } from "../../common/enums";

class UserService {
  private userDao: UserDao;

  constructor() {
    this.userDao = new UserDao();
  }

  public createUser = async (userData: IUser): Promise<IUser> => {
    try {
      const filter = {
        $and: [
          { $or: [{ email: userData.email }, { username: userData.username }] },
          { isDeleted: false },
        ],
      };
      const existUser: IUser | null = await this.userDao.getUserByIdOrEmail(
        filter
      );

      if (existUser) {
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
        userData.profile = `uploads/users-profile-picture/${userId}/${file.originalname}`;
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
          $match: {
            _id: new Types.ObjectId(id),
            isDeleted: false,
          },
        },
        {
          $lookup: {
            from: "follows",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ["$userId", "$$userId"] },
                      { $eq: ["$followingId", "$$userId"] },
                    ],
                  },
                },
              },
              {
                $project: { __v: 0 },
              },
            ],
            as: "followData",
          },
        },
        {
          $addFields: {
            following: {
              $filter: {
                input: "$followData",
                as: "f",
                cond: {
                  $and: [
                    { $eq: ["$$f.userId", "$_id"] },
                    { $eq: ["$$f.status", Status.ACCEPTED] },
                  ],
                },
              },
            },
            followers: {
              $filter: {
                input: "$followData",
                as: "f",
                cond: {
                  $and: [
                    { $eq: ["$$f.followingId", "$_id"] },
                    { $eq: ["$$f.status", Status.ACCEPTED] },
                  ],
                },
              },
            },
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
            followData: 0,
            __v: 0,
            isDeleted: 0,
            password: 0,
            createdAt: 0,
            updatedAt: 0,
          },
        },
      ];

      const userDetails: IUser[] | any = await this.userDao.getAllUsers(
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
        $lookup: {
          from: "follows",
          let: { myId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$userId", "$$myId"] },
                    { $eq: ["$followingId", "$$myId"] },
                  ],
                },
              },
            },
            {
              $project: { __v: 0 },
            },
          ],
          as: "followData",
        },
      });

      pipeline.push({
        $addFields: {
          following: {
            $filter: {
              input: "$followData",
              as: "f",
              cond: {
                $and: [
                  { $eq: ["$$f.userId", "$_id"] },
                  { $eq: ["$$f.status", Status.ACCEPTED] },
                ],
              },
            },
          },
          followers: {
            $filter: {
              input: "$followData",
              as: "f",
              cond: {
                $and: [
                  { $eq: ["$$f.followingId", "$_id"] },
                  { $eq: ["$$f.status", Status.ACCEPTED] },
                ],
              },
            },
          },
        },
      });

      pipeline.push(
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
            updatedAt: 0,
            createdAt: 0,
            followData: 0,
          },
        }
      );

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
      const randomNum = Math.floor(Math.random() * 899999 + 100000);
      const filter = {
        _id: id,
        isDeleted: false,
      };
      const existUser: IUser | null = await this.userDao.getUserByIdOrEmail(
        filter
      );

      const deleteUser = await this.userDao.updateUserById(id, {
        isDeleted: true,
        email: `${existUser?.email}-${randomNum}`,
      });
      if (!deleteUser) {
        throw {
          status: HttpStatusCode.INTERNAL_SERVER_ERROR,
          message: "Internal server error",
        };
      }
      return deleteUser;
    } catch (error: any) {
      throw error;
    }
  };
}

export default UserService;
