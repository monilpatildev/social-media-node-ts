import mongoose, { Document, Model, Types } from "mongoose";

export interface IFollow extends Document {
  userId: Types.ObjectId;
  followingId: Types.ObjectId;
  status: "pending" | "accepted";
}

const followSchema = new mongoose.Schema<IFollow>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    followingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const FollowModel: Model<IFollow> = mongoose.model<IFollow>(
  "Follow",
  followSchema
);

export default FollowModel;
