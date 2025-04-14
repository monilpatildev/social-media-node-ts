import { Status } from "../../common/enums";
import { IFollowQuery } from "../../common/interfaces";
import FollowModel, { IFollow } from "./follow.model";

class FollowDao {
  public createFollow = async (followData: IFollow): Promise<IFollow> => {
    try {
      return await FollowModel.create(followData);
    } catch (error: any) {
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

  public acceptFollowRequest = async (
    id: string,
    data: any
  ): Promise<IFollow | null> => {
    try {
      return await FollowModel.findByIdAndUpdate(id, data, {
        new: true,
      });
    } catch (error) {
      throw error;
    }
  };

  public getFollow = async (filter: any): Promise<IFollow[]> => {
    try {
      return await FollowModel.find(filter);
    } catch (error) {
      throw error;
    }
  };
}

export default FollowDao;
