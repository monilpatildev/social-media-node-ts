import mongoose, { Document, Model, Types } from "mongoose";
import { Status } from "../../common/enums";

export interface IFollow extends Document {
  userId: Types.ObjectId;
  followingId: Types.ObjectId;
  status: Status;
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
      enum: Object.values(Status),
      default: Status.PENDING,
    },
  },
  { timestamps: true }
);

const FollowModel: Model<IFollow> = mongoose.model<IFollow>(
  "Follow",
  followSchema
);

export default FollowModel;
