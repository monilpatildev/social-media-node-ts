import FollowModel, { IFollow } from "./follow.model";

class FollowDao {
  public createFollow = async (followData: IFollow) => {
    try {
      return await FollowModel.create(followData);
    } catch (error: any) {
      throw error;
    }
  };
  public findFollow = async (query: any): Promise<IFollow | null> => {
    try {
      const follow = await FollowModel.findOne(query).exec();
      return follow;
    } catch (error) {
      throw error;
    }
  };
  public deleteFollow = async (query: any): Promise<IFollow | null> => {
    try {
      const follow = await FollowModel.findOneAndDelete(query).exec();
      return follow;
    } catch (error) {
      throw error;
    }
  };
  public acceptFollowRequest = async (query: any, data: any): Promise<any> => {
    try {
      const follow = await FollowModel.findByIdAndUpdate(query, data, {
        new: true,
      });
      return follow;
    } catch (error) {
      throw error;
    }
  };
  public getFollowRequests = async (pipeline: any[]): Promise<any> => {
    try {
      const follow = await FollowModel.aggregate(pipeline);
      return follow;
    } catch (error) {
      throw error;
    }
  };
}

export default FollowDao;
