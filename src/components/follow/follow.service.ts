import { isObjectIdOrHexString, Types } from "mongoose";
import FollowDao from "./follow.dao";
import UserDao from "../user/user.dao";
import { IFollow } from "./follow.model";
import { IUser } from "../user/user.model";
import { Status } from "../../common/enums";
import { HttpStatusCode } from "../../common/httpStatusCode";

class FollowService {
  private followDao: FollowDao;
  private userDao: UserDao;

  constructor() {
    this.followDao = new FollowDao();
    this.userDao = new UserDao();
  }

  public followUser = async (
    userId: string,
    followingId: string
  ): Promise<string> => {
    try {
      if (!isObjectIdOrHexString(followingId)) {
        throw {
          status: HttpStatusCode.BAD_REQUEST,
          message: "Invalid user id",
        };
      }
      if (userId == followingId) {
        throw {
          status: HttpStatusCode.BAD_REQUEST,
          message: "You cannot send request to yourself",
        };
      }
      const pipeline = [
        {
          $match: {
            _id: new Types.ObjectId(followingId),
            isDeleted: false,
          },
        },
        {
          $project: {
            isPrivate: 1,
          },
        },
      ];

      const foundUserResult: IUser[] = await this.userDao.getUserByIdOrEmail(
        pipeline
      );

      if (!foundUserResult || !foundUserResult.length) {
        throw { status: HttpStatusCode.NOT_FOUND, message: "User not found" };
      }

      const existingFollow: IFollow | null = await this.followDao.findFollow({
        userId: new Types.ObjectId(userId),
        followingId: new Types.ObjectId(followingId),
      });

      if (existingFollow?.status === Status.ACCEPTED) {
        throw {
          status: HttpStatusCode.BAD_REQUEST,
          message: "You are already following this user",
        };
      } else if (existingFollow && existingFollow?.status === Status.PENDING) {
        throw {
          status: HttpStatusCode.BAD_REQUEST,
          message: "You have already requested this user",
        };
      }

      const status = foundUserResult[0].isPrivate
        ? Status.PENDING
        : Status.ACCEPTED;

      const followData = {
        userId: new Types.ObjectId(userId),
        followingId: new Types.ObjectId(followingId),
        status,
      } as IFollow;

      const createdFollow: IFollow = await this.followDao.createFollow(
        followData
      );
      if (!createdFollow) {
        throw {
          status: HttpStatusCode.BAD_REQUEST,
          message: "Internal server error",
        };
      }
      return status;
    } catch (error: any) {
      throw error;
    }
  };

  public unfollowUser = async (
    userId: string,
    followingId: string
  ): Promise<IFollow | null> => {
    try {
      if (!isObjectIdOrHexString(followingId)) {
        throw {
          status: HttpStatusCode.BAD_REQUEST,
          message: "Invalid user id",
        };
      }
      const followRecord: IFollow | null = await this.followDao.findFollow({
        userId: new Types.ObjectId(userId),
        followingId: new Types.ObjectId(followingId),
      });

      if (!followRecord) {
        throw { status: HttpStatusCode.NOT_FOUND, message: "User not found" };
      }

      const removedRecord: IFollow | null = await this.followDao.deleteFollow({
        userId: new Types.ObjectId(userId),
        followingId: new Types.ObjectId(followingId),
      });

      return removedRecord;
    } catch (error: any) {
      throw error;
    }
  };

  public acceptRequest = async (
    userId: string,
    followingId: string
  ): Promise<IFollow> => {
    try {
      const pipeline = [
        {
          $match: {
            _id: new Types.ObjectId(userId),
          },
        },
        {
          $project: {
            isPrivate: 1,
          },
        },
      ];

      const foundUserResult: IUser[] = await this.userDao.getUserByIdOrEmail(
        pipeline
      );
      if (foundUserResult[0].isPrivate === false) {
        throw {
          status: HttpStatusCode.BAD_REQUEST,
          message: "You account is public , request already accepted",
        };
      }

      if (!isObjectIdOrHexString(followingId)) {
        throw {
          status: HttpStatusCode.BAD_REQUEST,
          message: "Invalid user id",
        };
      }

      const existingFollowRequest: IFollow | null =
        await this.followDao.findFollow({
          userId: new Types.ObjectId(followingId),
          followingId: new Types.ObjectId(userId),
        });

      if (existingFollowRequest?.status === Status.ACCEPTED) {
        throw {
          status: HttpStatusCode.BAD_REQUEST,
          message: "Request already accepted",
        };
      } else if (!existingFollowRequest) {
        throw {
          status: HttpStatusCode.BAD_REQUEST,
          message: "Request not found",
        };
      }
      return (await this.followDao.acceptFollowRequest(
        existingFollowRequest._id?.toString()
      )) as IFollow;
    } catch (error: any) {
      throw error;
    }
  };

  public getRequest = async (userId: string): Promise<IFollow[]> => {
    try {
      const pipeline = [
        {
          $match: {
            _id: new Types.ObjectId(userId),
          },
        },
        {
          $project: {
            isPrivate: 1,
          },
        },
      ];

      const foundUserResult: IUser[] = await this.userDao.getUserByIdOrEmail(
        pipeline
      );
      if (foundUserResult[0].isPrivate === false) {
        throw {
          status: HttpStatusCode.BAD_REQUEST,
          message: "You account is public , no such request found",
        };
      }

      const getRequestPipeline = [
        {
          $match: {
            followingId: new Types.ObjectId(userId),
            status: Status.PENDING,
          },
        },
      ];
      const allRequests = await this.followDao.getFollowRequests(
        getRequestPipeline
      );
      if (!allRequests) {
        throw {
          status: HttpStatusCode.NOT_FOUND,
          message: "No requests found",
        };
      }
      return allRequests as IFollow[];
    } catch (error: any) {
      throw error;
    }
  };
}

export default FollowService;
