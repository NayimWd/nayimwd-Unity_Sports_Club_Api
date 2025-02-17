import mongoose, { Schema } from "mongoose";
import { IMatchResult } from "../../utils/types/SchemaTypes";

const matchResultSchema: Schema<IMatchResult> = new Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    defeated: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    margin: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      enum: ["normal", "DLS", "tie", "no result", "super over"],
      default: "normal",
    },
    manOfTheMatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    photo: String,
  },
  {
    timestamps: true,
  }
);

export const MatchResult = mongoose.model<IMatchResult>(
  "MatchResult",
  matchResultSchema
);
