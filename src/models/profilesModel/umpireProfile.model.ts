import mongoose, { Schema } from "mongoose";
import { IUmpireProfile } from "../../utils/types/SchemaTypes";

const umpireProfileSchema: Schema<IUmpireProfile> = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  yearsOfExperience: {
    type: Number,
    enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    required: true,
  },
  photo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

export const UmpireProfile = mongoose.model<IUmpireProfile>(
  "UmpireProfile",
  umpireProfileSchema
);
