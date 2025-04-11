import { Application, Request, RequestHandler, Response } from "express";
import authRoute from "../components/auth/auth.route";
import userRoute from "../components/user/user.route";
import postRoute from "../components/post/post.route";
import { ResponseHandler } from "../utils/responseHandler.util";
import { HttpStatusCode } from "../common/httpStatusCode";

class InitialRoute {
  static routes = (app: Application): void => {
  
    app.use("/api/auth", authRoute);
    app.use("/api/users", userRoute);
    app.use("/api/posts", postRoute);
    app.use((request: Request, response: Response): void => {
      ResponseHandler.error(
        response,
        HttpStatusCode.NOT_FOUND,
        "This endpoint not found"
      );
    });
  };
}

export default InitialRoute;
