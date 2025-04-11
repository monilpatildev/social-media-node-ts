import crypto from "crypto";
import { config } from "dotenv";
import { HttpStatusCode } from "../common/httpStatusCode";

config();

class PasswordManager {
  public async hashPassword(password: string): Promise<string> {
    try {
      const salt: string = process.env.SALT || "THeSALtVAlueS";
      const hashedPassword = await crypto
        .pbkdf2Sync(password, salt, 1000, 16, `sha512`)
        .toString(`hex`);
      return hashedPassword;
    } catch (error: any) {
      throw {
        status: error.status || HttpStatusCode.BAD_REQUEST,
        message: error.message || "Internal server error",
      };
    }
  }

  public async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    try {
      const salt: string = process.env.SALT || "THeSALtVAlueS";
      const hashedPassword = await crypto
        .pbkdf2Sync(password, salt, 1000, 16, `sha512`)
        .toString(`hex`);
      if (hashedPassword !== hash) {
        return false;
      }
      return true;
    } catch (error: any) {
      throw {
        status: error.status || HttpStatusCode.BAD_REQUEST,
        message: error.message || "Internal server error",
      };
    }
  }
}

export default new PasswordManager();
