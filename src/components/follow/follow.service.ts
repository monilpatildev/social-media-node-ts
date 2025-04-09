import { isObjectIdOrHexString, Types } from "mongoose";
import FollowDao from "./follow.dao";
import UserDao from "../user/user.dao";
import FollowModel, { IFollow } from "./follow.model";

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
  ): Promise<any> => {
    try {
      if (!isObjectIdOrHexString(followingId)) {
        throw { status: 400, message: "Invalid user id" };
      }
      if (userId == followingId) {
        throw { status: 400, message: "You cannot send request to yourself" };
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

      const foundUserResult = await this.userDao.getUserByIdOrEmail(pipeline);

      if (!foundUserResult || !foundUserResult.length) {
        throw { status: 404, message: "User not found" };
      }

      const existingFollow = await this.followDao.findFollow({
        userId: new Types.ObjectId(userId),
        followingId: new Types.ObjectId(followingId),
      });

      if (existingFollow?.status === "accepted") {
        throw {
          status: 400,
          message: "You are already following this user",
        };
      } else if (existingFollow && existingFollow?.status === "pending") {
        throw {
          status: 400,
          message: "You have already requested this user",
        };
      }

      const status = foundUserResult[0].isPrivate ? "pending" : "accepted";

      const followData = {
        userId: new Types.ObjectId(userId),
        followingId: new Types.ObjectId(followingId),
        status,
      } as IFollow;

      const createdFollow = await this.followDao.createFollow(followData);
      if (!createdFollow) {
        throw {
          status: 400,
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
  ): Promise<any> => {
    try {
      if (!isObjectIdOrHexString(followingId)) {
        throw { status: 400, message: "Invalid user id" };
      }
      const followRecord = await this.followDao.findFollow({
        userId: new Types.ObjectId(userId),
        followingId: new Types.ObjectId(followingId),
      });

      if (!followRecord) {
        throw { status: 404, message: "User not found" };
      }

      const removedRecord = await this.followDao.deleteFollow({
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

      const foundUserResult = await this.userDao.getUserByIdOrEmail(pipeline);
      if (foundUserResult[0].isPrivate === "false") {
        throw {
          status: 400,
          message: "You account is public , request already accepted",
        };
      }

      if (!isObjectIdOrHexString(followingId)) {
        throw { status: 400, message: "Invalid user id" };
      }

      const existingFollow = await this.followDao.findFollow({
        userId: new Types.ObjectId(followingId),
        followingId: new Types.ObjectId(userId),
      });

      if (existingFollow?.status === "accepted") {
        throw {
          status: 400,
          message: "Request already accepted",
        };
      } else if (!existingFollow) {
        throw {
          status: 400,
          message: "Request not found",
        };
      }
      return await this.followDao.acceptFollowRequest(existingFollow._id, {
        status: "accepted",
      });
    } catch (error: any) {
      throw error;
    }
  };

  public getRequest = async (userId: string): Promise<IFollow> => {
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

      const foundUserResult = await this.userDao.getUserByIdOrEmail(pipeline);
      if (foundUserResult[0].isPrivate === "false") {
        throw {
          status: 400,
          message: "You account is public , no such request found",
        };
      }

      const getRequestPipeline = [
        {
          $match: {
            followingId: new Types.ObjectId(userId),
            status: "pending",
          },
        },
      ];
      const allRequests = await this.followDao.getFollowRequests(
        getRequestPipeline
      );
      if (!allRequests) {
        throw { status: 404, message: "No requests found" };
      }
      return allRequests;
    } catch (error: any) {
      throw error;
    }
  };
}

export default FollowService;
