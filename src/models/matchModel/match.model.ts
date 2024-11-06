import mongoose, { Schema } from "mongoose";
import { IMatchTeype } from "../../utils/types/SchemaTypes";

const matchSchema: Schema<IMatchTeype> = new Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    matchType: {
      type: String,
      enum: ["knockout", "series", "1v1"],
      default: "knockout",
    },
    teams: [
      {
        teamA: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Team",
          required: true,
        },
      },
      {
        teamB: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Team",
          required: true,
        },
      },
    ],
    date: {
      type: Date,
      required: [true, "match date is required"],
    },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "live", "completed"],
      default: "upcoming",
    },
    umpires: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    matchResult: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MatchResult",
    },
    photos: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Match = mongoose.model<IMatchTeype>("Match", matchSchema);
