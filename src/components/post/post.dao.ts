import PostModel, { IPost } from "./post.model";

class PostDao {
  public getPostById = async (pipeline: any[]): Promise<IPost[]> => {
    try {
      return await PostModel.aggregate(pipeline);
    } catch (error: any) {
      throw error;
    }
  };
  public createPost = async (postData: IPost): Promise<any> => {
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
      return await PostModel.findByIdAndUpdate(id, postData, { new: true });
    } catch (error: any) {
      throw error;
    }
  };

  public deletePost = async (id: string): Promise<any> => {
    try {
      return await PostModel.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
      );
    } catch (error: any) {
      throw error;
    }
  };
}

export default PostDao;
