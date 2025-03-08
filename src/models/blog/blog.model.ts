import mongoose, { Schema, set } from "mongoose";
import { IBlog } from "../../utils/types/SchemaTypes";

const blogSchema: Schema<IBlog> = new Schema(
  {
    title: {
      type: String,
      required: [true, "blog title is required"],
      trim: true,
      min: 10,
      max: 500,
    },
    content: {
      type: String,
      required: [true, "blog title is required"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: {
      type: String,
      enum: ["news", "highlight", "tournaments", "awards"],
      default: "news",
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    likes: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    photo: ["String"],
  },
  {
    timestamps: true,
  }
);

// converting blog publis date to human readable format
blogSchema.virtual("DD/MM/YYYY").get(function () {
  return this.createdAt.toLocaleDateString();
});

// enable vertual
blogSchema.set("toJSON", { virtuals: true });

export const Blog = mongoose.model<IBlog>("Blog", blogSchema);
