import { isObjectIdOrHexString, Types } from "mongoose";
import {
  IFilterPostQuery,
  IGetAllPosts,
  IUploadedFile,
} from "../../common/interfaces";
import PostDao from "./post.dao";
import FollowDao from "../follow/follow.dao";
import path from "path";
import addToPipeline from "../../service/pipeline.service";
import { IPost } from "./post.model";
import { promises as fs } from "fs";
import { Status } from "../../common/enums";
import { HttpStatusCode } from "../../common/httpStatusCode";
import { updateFileName } from "../../utils/uploadImage.util";

class PostService {
  private postDao: PostDao;
  private followDao: FollowDao;
  constructor() {
    this.postDao = new PostDao();
    this.followDao = new FollowDao();
  }

  public createPost = async (
    postData: IPost,
    userId: string,
    files: IUploadedFile[]
  ): Promise<IPost> => {
    try {
      let imageStore: string[] = [];
      const newPostData = {
        postedBy: new Types.ObjectId(userId),
        title: postData.title,
        description: postData.description || "",
        images: imageStore,
      } as IPost;

      const savedPost: IPost = await this.postDao.createPost(newPostData);

      if (!savedPost) {
        throw {
          status: HttpStatusCode.BAD_REQUEST,
          message: "Internal server error",
        };
      }
      const newImagePath: string = await updateFileName(
        userId,
        savedPost?._id.toString()
      );

      const newImagePathArray = files.map(
        (file: IUploadedFile) => `${newImagePath}/${file.originalname}`
      );

      const updatedPostData = {
        images: newImagePathArray,
      } as IPost;

      return (await this.postDao.updatePost(
        savedPost._id.toString(),
        updatedPostData
      )) as IPost;
    } catch (error: any) {
      throw error;
    }
  };

  public updatePost = async (
    postData: Partial<IPost>,
    userId: string,
    postId: string,
    files?: IUploadedFile[]
  ): Promise<IPost> => {
    if (!isObjectIdOrHexString(postId)) {
      throw {
        status: HttpStatusCode.BAD_REQUEST,
        message: "Invalid post id",
      };
    }

    const postDetails: IPost[] = await this.postDao.findPostById({
      _id: new Types.ObjectId(postId),
    });
    if (!postDetails.length) {
      throw { status: HttpStatusCode.NOT_FOUND, message: "Post not found!!" };
    }

    const newPostData = {} as IPost;
    if (postData.title) newPostData.title = postData.title;
    if (postData.description) newPostData.description = postData.description;
    if (files && files.length) {
      newPostData.images = files.map((file: IUploadedFile) => {
        return `uploads/users-post/${userId}/${postId}/${file.originalname}`;
      });
    }

    return (await this.postDao.updatePost(postId, newPostData)) as IPost;
  };

  public getPost = async (id: string, userId: string): Promise<IPost[]> => {
    try {
      if (!isObjectIdOrHexString(id)) {
        throw {
          status: HttpStatusCode.BAD_REQUEST,
          message: "Invalid post id",
        };
      }
      const pipeline: any[] = [
        {
          $match: { _id: new Types.ObjectId(id) },
        },
        {
          $lookup: {
            from: "users",
            localField: "postedBy",
            foreignField: "_id",
            as: "postedBy",
          },
        },
        { $unwind: "$postedBy" },
        {
          $lookup: {
            from: "follows",
            let: { postedById: "$postedBy._id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$userId", new Types.ObjectId(userId)] },
                      { $eq: ["$followingId", "$$postedById"] },
                      { $eq: ["$status", Status.ACCEPTED] },
                    ],
                  },
                },
              },
            ],
            as: "isFollowing",
          },
        },
        {
          $match: {
            $or: [
              { "postedBy._id": new Types.ObjectId(userId) },
              { isFollowing: { $ne: [] } },
            ],
          },
        },
        {
          $project: {
            __v: 0,
            "postedBy.__v": 0,
            "postedBy.isDeleted": 0,
            "postedBy.createdAt": 0,
            "postedBy.updatedAt": 0,
            "postedBy.password": 0,
            isFollowing: 0,
          },
        },
      ];

      const postDetails: IPost[] = await this.postDao.getPostById(pipeline);

      if (!postDetails.length) {
        throw { status: HttpStatusCode.NOT_FOUND, message: "Post not found!" };
      }

      return postDetails;
    } catch (error: any) {
      throw error;
    }
  };

  public getAllPost = async (
    userId: string,
    query: IFilterPostQuery
  ): Promise<{ posts: IPost[]; totalPost: number }> => {
    try {
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

      const pipeline: any[] = [];

      // 1. Lookup the follows collection to get all followings for the current user.
      pipeline.push({
        $lookup: {
          from: "follows",
          let: { userId: new Types.ObjectId(userId) },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$userId", "$$userId"] },
                    { $eq: ["$status", "accepted"] },
                  ],
                },
              },
            },
            { $project: { followingId: 1 } },
          ],
          as: "followings",
        },
      });

      pipeline.push(
        {
          $addFields: {
            followingIds: {
              $map: { input: "$followings", as: "f", in: "$$f.followingId" },
            },
          },
        },
        {
          $addFields: {
            followingIds: {
              $concatArrays: ["$followingIds", [new Types.ObjectId(userId)]],
            },
          },
        },
        {
          $match: {
            $expr: { $in: ["$postedBy", "$followingIds"] },
          },
        }
      );

      pipeline.push(
        {
          $lookup: {
            from: "users",
            localField: "postedBy",
            foreignField: "_id",
            as: "postedBy",
          },
        },
        {
          $addFields: { postedBy: { $first: "$postedBy" } },
        },
        {
          $project: {
            __v: 0,
            "postedBy.__v": 0,
            "postedBy.isDeleted": 0,
            "postedBy.createdAt": 0,
            "postedBy.updatedAt": 0,
            "postedBy.password": 0,
            followings: 0,
            followingIds: 0,
          },
        }
      );

      pipeline.push(
        addToPipeline(
          [query.searchText, query.searchText, query.searchText],
          ["title", "postedBy.firstName", "postedBy.username"],
          true
        )
      );

      pipeline.push({
        $facet: {
          posts: [
            { $sort: { createdAt: sort } },
            { $skip: skip },
            { $limit: limit },
          ],
          totalPost: [{ $count: "count" }],
        },
      });

      const result: IGetAllPosts | any = await this.postDao.getAllPosts(
        pipeline
      );

      const posts = result[0]?.posts;
      const count = result[0]?.totalPost[0]?.count || 0;

      if (!posts?.length) {
        throw { status: HttpStatusCode.NOT_FOUND, message: "Posts not found!" };
      }

      return { totalPost: count, posts };
    } catch (error: any) {
      throw error;
    }
  };

  public deletePost = async (
    postId: string,
    userId: string
  ): Promise<IPost | null> => {
    try {
      if (!isObjectIdOrHexString(postId)) {
        throw {
          status: HttpStatusCode.BAD_REQUEST,
          message: "Invalid post id",
        };
      }

      const postDetails: IPost[] = await this.postDao.findPostById({
        _id: new Types.ObjectId(postId),
      });

      if (postDetails[0].postedBy.toString() !== userId) {
        throw {
          status: HttpStatusCode.UNAUTHORIZED,
          message: "You can not delete this post",
        };
      }

      if (!postDetails.length) {
        throw { status: HttpStatusCode.NOT_FOUND, message: "Post not found!" };
      }
      const dirPath = path.resolve(
        __dirname,
        `../../uploads/users-post/${userId}/${postId}`
      );
      await fs.rm(dirPath, { recursive: true, force: true });
      return await this.postDao.deletePost(postId);
    } catch (error: any) {
      throw error;
    }
  };
}

export default PostService;
