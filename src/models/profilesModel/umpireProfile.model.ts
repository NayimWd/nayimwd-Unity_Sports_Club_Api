import mongoose, { Schema } from "mongoose";
import { IUmpireProfile } from "../../utils/types/SchemaTypes";

const umpireProfileSchema: Schema<IUmpireProfile> = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  yearsOfExperience: Number,
});

export const UmpireProfile = mongoose.model<IUmpireProfile>(
  "UmpireProfile",
  umpireProfileSchema
);
