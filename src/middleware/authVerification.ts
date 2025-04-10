import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { ResponseHandler } from "../utils/responseHandler.util";
import UserDao from "../components/user/user.dao";
import { NextFunction, Request, Response } from "express";
import { isObjectIdOrHexString, Types } from "mongoose";
config();

class AuthMiddleware {
  private static UserDao = new UserDao();

  public static authenticate = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const accessSecretKey: string | any = process.env.ACCESS_SECRET_KEY;
      const accessToken: string | undefined =
        request.headers.authorization?.split(" ")[1];
      if (!accessToken) {
        return ResponseHandler.error(response, 401, "Invalid token");
      } else {
        try {
          const verifyRefreshToken: any = await jwt.verify(
            accessToken,
            accessSecretKey
          );
          if (!isObjectIdOrHexString(verifyRefreshToken._id)) {
            return ResponseHandler.error(response, 401, "Invalid token");
          }
          const pipeline: any = [
            {
              $match: {
                email: verifyRefreshToken.email,
                _id: new Types.ObjectId(verifyRefreshToken._id),
                isDeleted: false,
              },
            },
          ];
          const UserData = await this.UserDao.getUserByIdOrEmail(pipeline);
          if (!UserData.length) {
            return ResponseHandler.error(response, 401, "Invalid token");
          } else {
            (request as any).userData = verifyRefreshToken;
            next();
          }
        } catch (error: any) {
          if (error.name === "TokenExpiredError") {
            return ResponseHandler.error(
              response,
              401,
              "Session expired, Please sign in again"
            );
          }
          return ResponseHandler.error(response, 401, error.message);
        }
      }
    } catch (error: any) {
      return ResponseHandler.error(response, error.status, error.message);
    }
  };
}

export default AuthMiddleware;
