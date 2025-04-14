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

      const foundUserResult: IUser | null =
        await this.userDao.getUserByIdOrEmail({
          _id: followingId,
          isDeleted: false,
        });

      if (!foundUserResult) {
        throw { status: HttpStatusCode.NOT_FOUND, message: "User not found" };
      }

      const existingFollow: IFollow[] | null = await this.followDao.getFollow({
        userId: new Types.ObjectId(userId),
        followingId: new Types.ObjectId(followingId),
      });

      if (existingFollow[0]?.status === Status.ACCEPTED) {
        throw {
          status: HttpStatusCode.BAD_REQUEST,
          message: "You are already following this user",
        };
      } else if (
        existingFollow &&
        existingFollow[0]?.status === Status.PENDING
      ) {
        throw {
          status: HttpStatusCode.BAD_REQUEST,
          message: "You have already requested this user",
        };
      }

      const status = foundUserResult.isPrivate
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
      const followRecord: IFollow[] | null = await this.followDao.getFollow({
        userId: new Types.ObjectId(userId),
        followingId: new Types.ObjectId(followingId),
        status: Status.ACCEPTED,
      });

      if (!followRecord.length) {
        throw {
          status: HttpStatusCode.UNAUTHORIZED,
          message: "You can not unfollow this user!",
        };
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
      const foundUserResult: IUser | null =
        await this.userDao.getUserByIdOrEmail({
          _id: new Types.ObjectId(userId),
        });
      if (foundUserResult?.isPrivate === false) {
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

      const existingFollowRequest: IFollow[] | null =
        await this.followDao.getFollow({
          userId: new Types.ObjectId(followingId),
          followingId: new Types.ObjectId(userId),
        });

      if (existingFollowRequest[0]?.status === Status.ACCEPTED) {
        throw {
          status: HttpStatusCode.BAD_REQUEST,
          message: "Request already accepted",
        };
      } else if (!existingFollowRequest.length) {
        throw {
          status: HttpStatusCode.BAD_REQUEST,
          message: "Request not found",
        };
      }
      return (await this.followDao.acceptFollowRequest(
        existingFollowRequest[0]._id?.toString(),
        {
          status: Status.ACCEPTED,
        }
      )) as IFollow;
    } catch (error: any) {
      throw error;
    }
  };

  public getRequest = async (userId: string): Promise<IFollow[]> => {
    try {
      const foundUserResult: IUser | null =
        await this.userDao.getUserByIdOrEmail({
          _id: new Types.ObjectId(userId),
        });

      if (foundUserResult?.isPrivate === false) {
        throw {
          status: HttpStatusCode.BAD_REQUEST,
          message: "You account is public , no such request found",
        };
      }

      const allRequests = await this.followDao.getFollow({
        followingId: new Types.ObjectId(userId),
        status: Status.PENDING,
      });

      if (!allRequests.length) {
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
