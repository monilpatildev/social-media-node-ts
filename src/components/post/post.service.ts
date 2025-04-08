import { isObjectIdOrHexString, Types } from "mongoose";
import { IUploadedFile } from "../../common/interfaces";
import PostDao from "./post.dao";
import { IPost } from "./post.model";
import { updateFileName } from "../../utils/multerForPost.util";
import path from "path";
import { existsSync, mkdirSync, promises as fs } from "fs";

class PostService {
  private postDao: PostDao;

  constructor() {
    this.postDao = new PostDao();
  }

  public createPost = async (
    postData: any,
    userId: any,
    files: IUploadedFile[]
  ): Promise<any> => {
    try {
      const { _id } = userId;
      if (files) {
        const imageName = files.map((file: any) => file.originalname);
        const checkDuplicateImage = imageName.filter(
          (name: string, index: number) => imageName.indexOf(name) !== index
        );
        if (checkDuplicateImage.length)
          throw { status: 404, message: "You can not upload same image name" };
      }
      const imageStore: string[] = files.map(
        (file: IUploadedFile) => file.originalname
      );

      const newPostData = {
        postedBy: new Types.ObjectId(_id),
        title: postData.title,
        description: postData.description || "",
        images: imageStore,
      } as IPost;

      const savedPost = await this.postDao.createPost(newPostData);
      const newImagePath = await updateFileName(_id, savedPost._id.toString());

      const newImagePathArray = files.map(
        (file: IUploadedFile) => `${newImagePath}/${file.originalname}`
      );

      const updatedPostData = {
        images: newImagePathArray,
      } as IPost;

      const updatedImagePathPost = await this.postDao.updatePost(
        savedPost._id,
        updatedPostData
      );

      return updatedImagePathPost;
    } catch (error: any) {
      throw error;
    }
  };

  public updatePost = async (
    postData: any,
    userId: any,
    postId: string,
    files?: IUploadedFile[]
  ): Promise<any> => {
    try {
      const { _id } = userId;
      if (!isObjectIdOrHexString(postId)) {
        throw { status: 400, message: "Invalid post id" };
      }
      const pipeline: any[] = [
        { $match: { _id: new Types.ObjectId(postId), isDeleted: false } },
      ];
      const postDetails: IPost[] = await this.postDao.getPostById(pipeline);
      if (!postDetails.length) {
        throw { status: 404, message: "Post not found!" };
      }

      if (files) {
        const imageNames = files.map(
          (file: IUploadedFile) => file.originalname
        );
        const duplicateNames = imageNames.filter(
          (name, index) => imageNames.indexOf(name) !== index
        );
        if (duplicateNames.length) {
          throw {
            status: 404,
            message: "You cannot upload duplicate image names",
          };
        }
      }
      const newPostData = {} as IPost;
      if (postData.title) newPostData.title = postData.title;
      if (postData.description) newPostData.description = postData.description;
      if (files) {
        const dirPath = path.resolve(
          __dirname,
          `../../uploads/users-post/${_id}/${postId}`
        );
        console.log("Creating directory:", dirPath);
        await fs.rm(dirPath, { recursive: true, force: true });
        await fs.mkdir(dirPath, { recursive: true });
        const newImagePathArray = await Promise.all(
          files.map(async (file: IUploadedFile) => {
            const dest = path.join(dirPath, file.originalname);
            // await fs.rename(file.path, dest);
            console.log("dest ---------", dest);
            return dest;
          })
        );
        newPostData.images = newImagePathArray;
      }
      const updatedPost = await this.postDao.updatePost(postId, newPostData);
      return updatedPost;
    } catch (error: any) {
      throw error;
    }
  };

  public getPost = async (id: string) => {
    try {
      if (!isObjectIdOrHexString(id)) {
        throw { status: 400, message: "Invalid post id" };
      }
      const pipeline: any[] = [
        { $match: { _id: new Types.ObjectId(id), isDeleted: false } },
        {
          $lookup: {
            from: "users",
            localField: "postedBy",
            foreignField: "_id",
            as: "postedBy"
          },
        },
        {
          $addFields: {
            postedBy: { $first: "$postedBy" },
          },
        },
        {
          $project: {
            __v: 0,
            isDeleted: 0,
            createdAt: 0,
            updatedAt: 0,
            "postedBy.__v": 0,
            "postedBy.isDeleted": 0,
            "postedBy.createdAt": 0,
            "postedBy.updatedAt": 0,
          },
        },
      ];

      const postDetails: IPost[] = await this.postDao.getPostById(pipeline);
      // console.log(postDetails, id, pipeline);

      if (!postDetails.length) {
        throw { status: 404, message: "Post not found!" };
      }
      return postDetails;
    } catch (error: any) {
      throw error;
    }
  };
}

export default PostService;
