import mongoose, { Schema } from "mongoose";
import { ITeams } from "../../utils/types/SchemaTypes";

const teamSchema: Schema<ITeams> = new Schema({
  teamName: {
    type: String,
    required: [true, "Team name is required"],
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  players: [
    {
      playerId: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    {
      isCaptain: false,
    },
  ],
  playing11: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlayerProfile",
    },
  ],
  playerCount: {
    type: Number,
    min: 12,
    max: 18,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "disqualified", "withdrawn"],
  },
  teamLogo: {
    type: String,
  },
  photo: {
    type: String,
  },
}, {
    timestamps: true
});


export const Team = mongoose.model<ITeams>("Team", teamSchema)