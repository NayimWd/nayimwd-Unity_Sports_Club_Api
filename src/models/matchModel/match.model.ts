import mongoose, { Schema } from "mongoose";
import { IMatch } from "../../utils/types/SchemaTypes";
import { Schedule } from "../sceduleModel/schedules.model";

const matchSchema: Schema<IMatch> = new Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },
    matchNumber: {
      type: Number,
      required: true,
    },
    teamA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    teamB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null, 
    },
    previousMatches: {
      matchA: { type: mongoose.Schema.Types.ObjectId, ref: "Match", default: null },
      matchB: { type: mongoose.Schema.Types.ObjectId, ref: "Match", default: null },
    },
    status: {
      type: String,
      enum: ["upcoming", "scheduled", "rescheduled", "in-progress", "completed", "cancelled"],
      default: "upcoming",
    },
    umpires: {
      firstUmpire: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      secondUmpire: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      thirdUmpire: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
  },
  {
    timestamps: true,
  }
);

// Ensure matchNumber is unique per tournament
matchSchema.index({ tournamentId: 1, matchNumber: 1 }, { unique: true });

// Ensure either (teamA & teamB) or (previousMatches.matchA & matchB) is present
matchSchema.pre("validate", function (next) {
  if (!this.teamA && !this.teamB) {
    if (!this.previousMatches?.matchA || !this.previousMatches?.matchB) {
      return next(
        new Error("Either (teamA & teamB) or previousMatches (matchA & matchB) must be provided.")
      );
    }
  }
  next();
});

// When a match result is updated, modify the schedule accordingly
matchSchema.post("save", async function (doc) {
  if (doc.status === "completed" && doc.previousMatches) {
    await Schedule.updateMany(
      {
        $or: [
          { "teams.teamA": doc.previousMatches.matchA },
          { "teams.teamB": doc.previousMatches.matchB },
        ],
      },
      {
        $set: {
          "teams.teamA": doc.previousMatches.matchA ? doc.teamA : undefined,
          "teams.teamB": doc.previousMatches.matchB ? doc.teamB : undefined,
        },
      }
    );
  }
});

export const Match = mongoose.model<IMatch>("Match", matchSchema);