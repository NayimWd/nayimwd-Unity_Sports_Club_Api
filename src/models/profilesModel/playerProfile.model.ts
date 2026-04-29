import mongoose, { Schema } from "mongoose";
import { IPlayerProfile } from "../../utils/types/SchemaTypes";

const playerProfileSchema: Schema<IPlayerProfile> = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    index: true,
    required: [true, "User id is required"],
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
  },
  player_role: {
    type: String,
    enum: ["batsman", "bowler", "all-rounder", "wk-batsman"],
    required: [true, "Player role is required"],
  },
  batingStyle: {
    type: String,
    enum: ["right hand", "left hand"],
    required: [true, "bating style is required"],
  },
  bowlingArm: {
    type: String,
    enum: ["left arm", "right arm"],
    required: [true, "bowling arm info is required"],
  },
  bowlingStyle: {
    type: String,
    enum: ["fast", "spin", "swing", "seam"],
    required: [true, "bating style is required"],
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
