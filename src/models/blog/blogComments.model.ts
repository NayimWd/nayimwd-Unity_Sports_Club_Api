import mongoose, { Schema } from "mongoose";
import { IComment } from "../../utils/types/SchemaTypes";

const commentSchema: Schema<IComment> = new Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog", // Reference to Blog model
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      required: true,
    },
    comment: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      minlength: 1,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

export const Comment = mongoose.model<IComment>("Comment", commentSchema);
