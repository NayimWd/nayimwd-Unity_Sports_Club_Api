import mongoose, { Schema } from "mongoose";
import { IPlayerProfile } from "../../utils/types/SchemaTypes";

const playerProfileSchema: Schema<IPlayerProfile> = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User id is required"],
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team"
  },
  player_role: {
    type: String,
    enum: ["batsman", "bowler", "all-rounder", "wk-batsman"],
  },
  batingStyle: {
    type: String,
    enum: ["right hand", "left hand"],
  },
  bowlingArm: {
    type: String,
    enum: ["left arm", "right arm"],
  },
  bowlingStyle: {
    type: String,
    enum: ["fast", "spin", "swing", "seam"],
  },
  DateOfBirth: {
    type: Date,
  },
  photo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

export const PlayerProfile = mongoose.model<IPlayerProfile>(
  "PlayerProfile",
  playerProfileSchema
);
