import mongoose, { Schema } from "mongoose";
import { IManagerProfile } from "../../utils/types/SchemaTypes";

const managerProfileSchema: Schema<IManagerProfile> = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "manager Id is required"],
  },
  teamsManaged: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },

  ],
});

export const ManagerProfile = mongoose.model<IManagerProfile>("ManagerProfile", managerProfileSchema)