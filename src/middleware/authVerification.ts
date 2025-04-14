import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { ResponseHandler } from "../utils/responseHandler.util";
import UserDao from "../components/user/user.dao";
import { NextFunction, Request, Response } from "express";
import { isObjectIdOrHexString, Types } from "mongoose";
import { HttpStatusCode } from "../common/httpStatusCode";
import { IAuthToken } from "../common/interfaces";
config();

export interface CustomRequest extends Request {
  userData?: IAuthToken | any;
}
class AuthMiddleware {
  private static UserDao = new UserDao();

  public static authenticate = (): any => {
    return async (
      request: CustomRequest,
      response: Response,
      next: NextFunction
    ) => {
      try {
        const accessSecretKey: string =
          process.env.ACCESS_SECRET_KEY || "accessKEY";
        const accessToken: string | undefined =
          request.headers.authorization?.split(" ")[1];
        if (!accessToken) {
          return ResponseHandler.error(
            response,
            HttpStatusCode.UNAUTHORIZED,
            "Invalid token"
          );
        } else {
          try {
            const verifyRefreshToken = (await jwt.verify(
              accessToken,
              accessSecretKey
            )) as IAuthToken;

            if (!isObjectIdOrHexString(verifyRefreshToken._id)) {
              return ResponseHandler.error(
                response,
                HttpStatusCode.UNAUTHORIZED,
                "Invalid token"
              );
            }

            const UserData = await this.UserDao.getUserByIdOrEmail({
              email: verifyRefreshToken.email,
              _id: new Types.ObjectId(verifyRefreshToken._id),
              isDeleted: false,
            });
            if (!UserData) {
              return ResponseHandler.error(
                response,
                HttpStatusCode.UNAUTHORIZED,
                "Invalid token"
              );
            } else {
              request.userData = verifyRefreshToken;
              next();
            }
          } catch (error: any) {
            if (error.name === "TokenExpiredError") {
              return ResponseHandler.error(
                response,
                HttpStatusCode.UNAUTHORIZED,
                "Session expired, Please sign in again"
              );
            }
            return ResponseHandler.error(
              response,
              HttpStatusCode.UNAUTHORIZED,
              error.message
            );
          }
        }
      } catch (error: any) {
        return ResponseHandler.error(response, error.status, error.message);
      }
    };
  };
}

export default AuthMiddleware;
