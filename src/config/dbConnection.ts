import mongoose from "mongoose";

class MongoDBConnection {
  static connect(url: string): void {
    try {
      mongoose.connect(url);
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }
  }
}

export default MongoDBConnection;
