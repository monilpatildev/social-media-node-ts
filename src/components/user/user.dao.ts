import UserModel, { IUser } from "./user.model";

class UserDao {
  public createUser = async (user: IUser): Promise<any> => {
    try {
      return await UserModel.create(user);
    } catch (error: any) {
      throw error;
    }
  };

  public getUserByIdOrEmail = async (pipeline: any[]): Promise<any> => {
    try {
      return await UserModel.aggregate(pipeline);
    } catch (error: any) {
      throw error;
    }
  };

  public deleteUserById = async (id: string): Promise<any> => {
    try {
      return await UserModel.findByIdAndUpdate(
        id,
        { isDeleted: true },
        {
          new: true,
        }
      );
    } catch (error: any) {
      throw error;
    }
  };

  public updateUserById = async (id: string, data: any): Promise<any> => {
    try {
      return await UserModel.findByIdAndUpdate(id, data, {
        new: true,
        upsert: true,
      });
    } catch (error: any) {
      throw error;
    }
  };
}

export default UserDao;
