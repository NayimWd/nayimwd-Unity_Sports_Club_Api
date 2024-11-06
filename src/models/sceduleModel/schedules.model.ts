import mongoose, { Schema } from "mongoose";
import { ISchedule } from "../../utils/types/SchemaTypes";

const scheduleSchema: Schema<ISchedule> = new Schema(
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
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },
    matchNumber: {
      type: Number,
      required: true,
    },
    round: {
      type: String,
      enum: ["round 1", "Quarter-Final", "Semi-Final", "Final"],
      required: true,
    },
    teams: [
      {
        teamA: {
          type: mongoose.Types.ObjectId,
          ref: "Team",
          required: true,
        },
        teamB: {
          type: mongoose.Types.ObjectId,
          ref: "Team",
          required: true,
        },
      },
    ],
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "cancelled", "completed"],
      default: "scheduled",
    },
    matchResult: {
      type: mongoose.Types.ObjectId,
      ref: "MatchResult",
    },
  },
  {
    timestamps: true,
  }
);

export const Schedule = mongoose.model<ISchedule>("schedule", scheduleSchema);
