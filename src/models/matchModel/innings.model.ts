import mongoose, { Schema } from "mongoose";
import { IInningType } from "../../utils/types/SchemaTypes";

const inningsSchema: Schema<IInningType> = new Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },
    inningsNumber: {
      type: Number,
      enum: [1, 2],
      default: 1,
    },
    wicket: {
      type: Number,
      required: true,
    },
    runs: {
      type: Number,
      required: true,
    },
    overs: {
      type: Number,
      required: true,
    },
    extras: {
      wide: {
        type: Number,
        required: true,
      },
      noBalls: {
        type: Number,
        required: true,
      },
      byes: {
        type: Number,
        required: true,
      },
      totalExtras: {
        type: Number,
        require: true,
      },
    },
    totalRuns: {
      type: Number,
    },
  },
  { timestamps: true }
);

export const Innings = mongoose.model<IInningType>("Innings", inningsSchema);
