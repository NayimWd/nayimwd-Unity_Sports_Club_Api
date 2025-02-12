import mongoose, { Schema } from "mongoose";
import { IMatch } from "../../utils/types/SchemaTypes";
import { Schedule } from "../sceduleModel/schedules.model";

const matchSchema: Schema<IMatch> = new Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    matchNumber: {
      type: Number,
      required: true,
      unique: true, // Ensure unique match numbers per tournament
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
      enum: ["upcoming", "live", "completed"],
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

// Ensure either (teamA & teamB) or (previousMatches.matchA & matchB) is present
matchSchema.pre("validate", function (next) {
  if ((!this.teamA || !this.teamB) && (!this.previousMatches.matchA || !this.previousMatches.matchB)) {
    next(new Error("Either teams (teamA, teamB) or previousMatches (matchA, matchB) must be provided."));
  } else {
    next();
  }
});

// When a match is completed, update the next round's Schedule with the winner
matchSchema.post("save", async function (doc) {
  if (doc.status === "completed" && doc.winner) {
    await Schedule.updateMany(
      {
        $or: [
          { "previousMatches.matchA": doc._id },
          { "previousMatches.matchB": doc._id },
        ],
      },
      {
        $set: {
          "teams.teamA": doc.previousMatches.matchA ? doc.winner : undefined,
          "teams.teamB": doc.previousMatches.matchB ? doc.winner : undefined,
        },
      }
    );
  }
});

export const Match = mongoose.model<IMatch>("Match", matchSchema);
