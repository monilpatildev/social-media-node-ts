import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { Status } from "../../common/enums";

export interface IFollow extends Document {
  userId: Types.ObjectId;
  followingId: Types.ObjectId;
  status: Status;
  _id: Types.ObjectId;
}

const followSchema = new mongoose.Schema<IFollow>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  followingId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(Status),
    default: Status.PENDING,
  },
});

const FollowModel: Model<IFollow> = mongoose.model<IFollow>(
  "Follow",
  followSchema
);

export default FollowModel;
