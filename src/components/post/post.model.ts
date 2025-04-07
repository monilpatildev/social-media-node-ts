import mongoose, { Document, Types } from "mongoose";

export interface IPost extends Document {
  title: string;
  description: string;
  image: string[];
  postedBy: Types.ObjectId;
}

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    image: {
      type: [String],
      default: [],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const PostModel: Model<IPost> = mongoose.model<IPost>("Post", postSchema);

export default PostModel;
