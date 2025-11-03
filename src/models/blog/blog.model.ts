import mongoose, { Schema, set } from "mongoose";
import { IBlog } from "../../utils/types/SchemaTypes";

const blogSchema: Schema<IBlog> = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      min: 10,
      max: 500,
      index: true,
    },
    content: { type: String, required: true },
    author: String,
    tags: {
      type: String,
      enum: ["news", "highlight", "tournaments", "awards"],
      default: "news",
      index: true,
    },
    isPublished: { type: Boolean, default: true },
    photo: [String],
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
