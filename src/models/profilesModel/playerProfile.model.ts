import mongoose, { Schema } from "mongoose";
import { IPlayerProfile } from "../../utils/types/SchemaTypes";

const playerProfileSchema: Schema<IPlayerProfile> = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User id is required"],
  },
  teaamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: [true, "Team id is required"],
  },
  role: {
    type: String,
    enum: ["batsman", "bowler", "all-rounder", "wk-batsman"],
    required: true,
  },
  batingStyle: {
    type: String,
    enum: ["Right Hand", "Left Hand"],
    required: true,
  },
  bowlingArm: {
    type: String,
    enum: ["left arm", "right arm"],
    required: true,
  },
  bowlingStyle: {
    type: String,
    enum: ["fast", "spin", "swing", "seam"],
    required: true,
  },
  DateOfBirth: {
    type: Date,
    required: true,
  },
});


export const PlayerProfile = mongoose.model<IPlayerProfile>("PlayerProfile", playerProfileSchema)