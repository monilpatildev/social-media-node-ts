import { required } from "joi";
import mongoose, { Document, Model, Types } from "mongoose";

interface IFollow extends Document {
  userId: Types.ObjectId;
  followingId: Types.ObjectId;
  requested: boolean;
}

const followSchema = new mongoose.Schema<IFollow>({
  userId: { type: new mongoose.Schema.Types.ObjectId(), required: true },
  followingId: { type: new mongoose.Schema.Types.ObjectId(), required: true },
  requested: {
    type: Boolean,
    default: true,
  },
});

const FollowModel: Model<IFollow> = mongoose.model<IFollow>(
  "follow",
  followSchema
);

export default FollowModel;
