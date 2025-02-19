import mongoose, { Schema } from "mongoose";
import { IMatchResult } from "../../utils/types/SchemaTypes";
import { PointTable } from "../point table/pointTables.model";

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
    matchReport: {
      type: String,
    },
    photo: String,
  },
  {
    timestamps: true,
  }
);

matchResultSchema.post("save", async function (doc) {
  try {
    // Update points for the winning team
    await PointTable.findOneAndUpdate(
      { tournamentId: doc.tournamentId, teamId: doc.winner },
      { $inc: { wins: 1, matchPlayed: 1, points: 2 } },
      { upsert: true, new: true }
    );

    // Update losses for the defeated team
    await PointTable.findOneAndUpdate(
      { tournamentId: doc.tournamentId, teamId: doc.defeated },
      { $inc: { losses: 1, matchPlayed: 1 } },
      { upsert: true, new: true }
    );

    console.log(`Updated PointTable for Tournament ${doc.tournamentId}`);
  } catch (error) {
    console.error("Error updating PointTable:", error);
  }
});

export const MatchResult = mongoose.model<IMatchResult>(
  "MatchResult",
  matchResultSchema
);
