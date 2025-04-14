import { IGetAllPosts } from "../../common/interfaces";
import PostModel, { IPost } from "./post.model";

class PostDao {
  public getPostById = async (pipeline: any[]): Promise<IPost[]> => {
    try {
      return await PostModel.aggregate(pipeline);
    } catch (error: any) {
      throw error;
    }
  };

  public findPostById = async (filter: any): Promise<IPost[]> => {
    try {
      return await PostModel.find(filter);
    } catch (error: any) {
      throw error;
    }
  };

  public getAllPosts = async (
    pipeline: any[]
  ): Promise<IGetAllPosts | any[]> => {
    try {
      return await PostModel.aggregate(pipeline);
    } catch (error: any) {
      throw error;
    }
  };

  public createPost = async (postData: IPost): Promise<IPost> => {
    try {
      return await PostModel.create(postData);
    } catch (error: any) {
      throw error;
    }
  };

  public updatePost = async (
    id: string,
    postData: IPost
  ): Promise<IPost | null> => {
    try {
      return await PostModel.findByIdAndUpdate(id, postData, {
        new: true,
        upsert: true,
      });
    } catch (error: any) {
      throw error;
    }
  };

  public deletePost = async (id: string): Promise<IPost | null> => {
    try {
      return await PostModel.findByIdAndDelete(id);
    } catch (error: any) {
      throw error;
    }
  };
}

export default PostDao;
