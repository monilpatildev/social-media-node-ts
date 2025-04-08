import { Application, Request, Response, NextFunction } from "express";
import authRoute from "../components/auth/auth.route";
import userRoute from "../components/user/user.route";
import { ResponseHandler } from "../utils/responseHandler.util";
import postRoute from "../components/post/post.route";
class InitialRoute {
  static routes = (app: Application): void => {
    app.use("/api/auth", authRoute);
    app.use("/api/users", userRoute);
    app.use("/api/posts", postRoute);

    // app.use("*", (request: Request, response: Response): void => {
    //   ResponseHandler.error(response, 404, "This endpoint not found");
    // });
  };
}

export default InitialRoute;
