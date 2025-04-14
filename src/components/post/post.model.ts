import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IPost extends Document {
  title: string;
  description?: string;
  images: string[];
  postedBy: Types.ObjectId;
  _id: Types.ObjectId;
}

const postSchema = new mongoose.Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const PostModel: Model<IPost> = mongoose.model<IPost>("Post", postSchema);

export default PostModel;
