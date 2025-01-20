import mongoose, { Schema } from "mongoose";
import { ISchedule } from "../../utils/types/SchemaTypes";

const scheduleSchema: Schema<ISchedule> = new Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true, // Index for faster querying
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
      min: [1, "Match number must be at least 1"],
    },
    round: {
      type: String,
      enum: [
        "round 1",
        "round 2",
        "Quarter-Final",
        "Semi-Final",
        "Final",
        "Playoff",
      ],
      required: true,
    },
    teams: {
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
    matchDate: {
      type: String,
      required: true,
      validate: {
        validator: function (value: string) {
          return /^\d{2}-\d{2}-\d{4}$/.test(value); // Matches format like "22-01-2025"
        },
        message: "Date must be in the format DD-MM-YYYY.",
      },
    },
    matchTime: {
      type: String,
      required: true,
      validate: {
        validator: function (value: string) {
          return /^(1[0-2]|0?[1-9])(am|pm)$/.test(value.toLowerCase()); // Matches format like "2pm"
        },
        message: "Time must be in the format h(am/pm).",
      },
    },
    status: {
      type: String,
      enum: [
        "scheduled",
        "rescheduled",
        "in-progress",
        "cancelled",
        "completed",
      ],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  }
);

// Add compound index for tournament and match number
scheduleSchema.index({ tournamentId: 1, matchNumber: 1 }, { unique: true });

export const Schedule = mongoose.model<ISchedule>("Schedule", scheduleSchema);
