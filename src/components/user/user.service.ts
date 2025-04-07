import UserDao from "./user.dao";
import { IUser } from "./user.model";
import passwordManager from "../../utils/password.util";
import { isObjectIdOrHexString, Types } from "mongoose";
import addToPipeline from "../../service/pipeline.service";

class UserService {
  private userDao: UserDao;

  constructor() {
    this.userDao = new UserDao();
  }

  public createUser = async (userData: IUser): Promise<any> => {
    try {
      const pipeline: any[] = [
        {
          $match: {
            $or: [{ email: userData.email }, { username: userData.username }],
          },
        },
      ];
      const existUser = await this.userDao.getUserByIdOrEmail(pipeline);
      if (existUser.length) {
        throw { status: 400, message: "Email or username already used" };
      }
      const { firstName, lastName, email, password, username } = userData;
      const hashedPassword = await passwordManager.hashPassword(password);
      const user: any = {
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword,
      };
      const createUser = await this.userDao.createUser(user);
      if (!createUser) {
        throw { status: 500, message: "Internal server error" };
      }
      const findUserPipeline: any[] = [
        { $match: { _id: createUser._id } },
        {
          $project: {
            __v: 0,
            isDeleted: 0,
            password: 0,
            role: 0,
          },
        },
      ];
      const foundUser = await this.userDao.getUserByIdOrEmail(findUserPipeline);
      return foundUser[0];
    } catch (error: any) {
      throw error;
    }
  };

  public updateUser = async (userData: any): Promise<any> => {
    try {
      console.log(userData);
      
    } catch (error: any) {
      throw error;
    }
  };

  public getUser = async (id: string): Promise<any> => {
    try {
      if (!isObjectIdOrHexString(id)) {
        throw { status: 400, message: "Invalid user id" };
      }
      const pipeline: any[] = [
        { $match: { _id: new Types.ObjectId(id), isDeleted: false } },
        {
          $project: {
            __v: 0,
            isDeleted: 0,
            password: 0,
            createdAt: 0,
            updatedAt: 0,
          },
        },
        {
          $addFields: {
            totalFollowers: { $size: "$followers" },
            totalFollowing: { $size: "$following" },
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

  public getLoggedUser = async (userData: any): Promise<any> => {
    try {
      const pipeline: any[] = [
        { $match: { _id: new Types.ObjectId(userData._id) } },
        {
          $project: {
            __v: 0,
            isDeleted: 0,
            password: 0,
            createdAt: 0,
            updatedAt: 0,
          },
        },
        {
          $addFields: {
            totalFollowers: { $size: "$followers" },
            totalFollowing: { $size: "$following" },
          },
        },
      ];
      const userDetails: IUser[] = await this.userDao.getUserByIdOrEmail(
        pipeline
      );

      if (!userDetails.length) {
        throw { status: 404, message: "Profile not found!" };
      }
      return userDetails;
    } catch (error: any) {
      throw error;
    }
  };

  public getAllUser = async (query: any): Promise<any> => {
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

      const pageNumber = parseInt(query.pageNumber, 10) || 1;
      const limit = parseInt(query.limit, 10) || 10;
      const skip = (pageNumber - 1) * limit;

      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });

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

  public deleteUser = async (id: string): Promise<any> => {
    try {
      if (!isObjectIdOrHexString(id)) {
        throw { status: 400, message: "Invalid user id" };
      }
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
