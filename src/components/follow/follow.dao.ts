import { IFollowQuery } from "../../common/interfaces";
import FollowModel, { IFollow } from "./follow.model";

class FollowDao {
  public createFollow = async (
    followData: IFollow
  ): Promise<IFollow | null> => {
    try {
      return await FollowModel.create(followData);
    } catch (error: any) {
      throw error;
    }
  };
  public findFollow = async (query: IFollowQuery): Promise<IFollow | null> => {
    try {
      return await FollowModel.findOne(query);
    } catch (error) {
      throw error;
    }
  };
  public deleteFollow = async (
    query: IFollowQuery
  ): Promise<IFollow | null> => {
    try {
      return await FollowModel.findOneAndDelete(query);
    } catch (error) {
      throw error;
    }
  };
  public acceptFollowRequest = async (query: any, data: any): Promise<any> => {
    try {
      return await FollowModel.findByIdAndUpdate(query, data, {
        new: true,
      });
    } catch (error) {
      throw error;
    }
  };
  public getFollowRequests = async (pipeline: any[]): Promise<any> => {
    try {
      return await FollowModel.aggregate(pipeline);
    } catch (error) {
      throw error;
    }
  };
}

export default FollowDao;
