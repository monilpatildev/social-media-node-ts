import jwt from "jsonwebtoken";
import AuthMiddleware from "../../middleware/authVerification";
import passwordManager from "../../utils/password.util";
import UserDao from "../user/user.dao";
import { ResponseHandler } from "../../utils/responseHandler.util";
import { IUser } from "../user/user.model";
import { IAuthToken, ITokens } from "../../common/interfaces";
import { HttpStatusCode } from "../../common/httpStatusCode";

class AuthService {
  private UserDao: UserDao;

  constructor() {
    this.UserDao = new UserDao();
  }

  public authenticateUser = async (
    email: string,
    password: string
  ): Promise<ITokens> => {
    try {
      const pipeline: any[] = [{ $match: { email, isDeleted: false } }];
      const user: IUser[] = await this.UserDao.getUserByIdOrEmail(pipeline);

      if (!user.length) {
        throw {
          status: HttpStatusCode.BAD_REQUEST,
          message: "Invalid email or password",
        };
      }

      const isPasswordValid: boolean = await passwordManager.comparePassword(
        password,
        user[0].password
      );
      if (!isPasswordValid) {
        throw {
          status: HttpStatusCode.BAD_REQUEST,
          message: "Invalid email or password",
        };
      }
      return this.GenerateAccessToken(user[0]);
    } catch (error) {
      throw error;
    }
  };

  public GenerateAccessToken = async (
    user: IUser | IAuthToken
  ): Promise<ITokens> => {
    const accessSecretKey: string =
      process.env.ACCESS_SECRET_KEY || "Access secret";
    const refreshSecretKey: string =
      process.env.REFRESH_SECRET_KEY || "Refresh secret";

    try {
      const accessToken = await jwt.sign(
        {
          _id: user._id,
          email: user.email,
        },
        accessSecretKey,
        { expiresIn: "2h" }
      );
      const refreshToken = await jwt.sign(
        {
          _id: user._id,
          email: user.email,
        },
        refreshSecretKey,
        { expiresIn: "24h" }
      );
      return { accessToken, refreshToken };
    } catch (error: any) {
      throw error;
    }
  };

  public GenerateRefreshToken = async (
    refreshToken: string
  ): Promise<ITokens> => {
    const refreshSecretKey: string =
      process.env.REFRESH_SECRET_KEY || "Refresh secret";

    try {
      const verifyRefreshToken = await jwt.verify(
        refreshToken,
        refreshSecretKey
      ) as IAuthToken
      const tokens: ITokens = await this.GenerateAccessToken(
        verifyRefreshToken
      );
      return tokens;
    } catch (error: any) {
      throw error;
    }
  };
}

export default AuthService;
