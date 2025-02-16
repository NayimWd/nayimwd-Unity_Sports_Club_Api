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
    },
    teamB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
    previousMatches: {
      matchA: { type: mongoose.Schema.Types.ObjectId, ref: "Match" },
      matchB: { type: mongoose.Schema.Types.ObjectId, ref: "Match" },
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
    status: {
      type: String,
      enum: ["upcoming", "scheduled", "rescheduled", "in-progress", "completed", "cancelled"], 
    default: "upcoming",
    },
    umpires: {
      firstUmpire: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      secondUmpire: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      thirdUmpire: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    photo: String,
  },
  {
    timestamps: true,
  }
);

// Ensure matchNumber is unique per tournament
matchSchema.index({ tournamentId: 1, matchNumber: 1 }, { unique: true });

// Ensure either (teamA & teamB) or (previousMatches.matchA & matchB) is present
matchSchema.pre("validate", function (next) {
  if (
    (!this.teamA || !this.teamB) &&
    (!this.previousMatches || !this.previousMatches.matchA || !this.previousMatches.matchB)
  ) {
    return next(
      new Error(
        "Either teams (teamA, teamB) or previousMatches (matchA, matchB) must be provided."
      )
    );
  }
  next();
});

// When a match is completed, update the next round's Schedule with the winner
matchSchema.post("save", async function (doc) {
  if (doc.status === "completed" && doc.winner) {
    await Schedule.updateMany(
      {
        $or: [
          { "teams.teamA": doc._id },
          { "teams.teamB": doc._id },
        ],
      },
      {
        $set: {
          "teams.teamA": doc.previousMatches?.matchA ? doc.winner : undefined,
          "teams.teamB": doc.previousMatches?.matchB ? doc.winner : undefined,
        },
      }
    );
  }
});

export const Match = mongoose.model<IMatch>("Match", matchSchema);