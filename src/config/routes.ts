import { Application, Request, Response, NextFunction } from "express";
import authRoute from "../components/auth/auth.route";
import userRoute from "../components/user/user.route";
import { ResponseHandler } from "../utils/responseHandler.util";

class InitialRoute {
  public static routes(app: Application): void {
    app.use("/api/auth", authRoute);
    app.use("/api/users", userRoute);
    // app.all("*", (req: Request, res: Response, next: NextFunction) => {
    //   return ResponseHandler.error(res, 404, "This endpoint not found");
    // });
  }
}

export default InitialRoute;
