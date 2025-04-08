import express, { Application, NextFunction, Request, Response } from "express";
import { Server } from "http";
import { config } from "dotenv";
import { rateLimit } from "express-rate-limit";
import path from "path";
import multer from "multer";
import cors from "cors";
import MongoDBConnection from "./config/dbConnection";
import InitialRoute from "./config/routes";
import { ResponseHandler } from "./utils/responseHandler.util";

config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || "4000", 10);
const MONGODB_URI = process.env.MONGODB_URI as string;

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,PATCH,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message:
    "You cannot make more than 100 requests per minute from the same IP.",
});
app.use(limiter);

app.use(
  (error: any, request: Request, response: Response, next: NextFunction) => {
    if (error instanceof SyntaxError && "body" in error) {
      ResponseHandler.error(response, 400, "Invalid JSON syntax");
    } else {
      next();
    }
  }
);

app.use(
  (error: Error, request: Request, response: Response, next: NextFunction) => {
    ResponseHandler.error(response, 500, error.message);
  }
);

const server: Server = app.listen(PORT, async () => {
  MongoDBConnection.connect(MONGODB_URI);
  InitialRoute.routes(app);
  console.log(`Server running on port ${PORT}`);
});
