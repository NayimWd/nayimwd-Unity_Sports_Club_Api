import mongoose, { Schema } from "mongoose";
import { ISchedule } from "../../utils/types/SchemaTypes";

const scheduleSchema: Schema<ISchedule> = new Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: function () {
        return this.round.toLowerCase().includes("round"); 
      },
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
      teamA: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
      teamB: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    },
    previousMatches: {
      matchA: { type: mongoose.Schema.Types.ObjectId, ref: "Match" },
      matchB: { type: mongoose.Schema.Types.ObjectId, ref: "Match" },
    },
    matchDate: {
      type: String,
      required: true,
      validate: {
        validator: function (value: string) {
          return /^\d{2}-\d{2}-\d{4}$/.test(value);
        },
        message: "Date must be in the format DD-MM-YYYY.",
      },
    },
    matchTime: {
      type: String,
      required: true,
      validate: {
        validator: function (value: string) {
          return /^(1[0-2]|0?[1-9])(am|pm)$/.test(value.toLowerCase());
        },
        message: "Time must be in the format h(am/pm).",
      },
    },
    status: {
      type: String,
      enum: ["scheduled", "rescheduled", "in-progress", "cancelled", "completed"],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure either (teamA & teamB) or (previousMatches.matchA & matchB) is present
scheduleSchema.pre("validate", function (next) {
  if ((!this.teams.teamA || !this.teams.teamB) && (!this.previousMatches.matchA || !this.previousMatches.matchB)) {
    next(new Error("Either teams (teamA, teamB) or previousMatches (matchA, matchB) must be provided."));
  } else {
    next();
  }
});

export const Schedule = mongoose.model<ISchedule>("Schedule", scheduleSchema);
