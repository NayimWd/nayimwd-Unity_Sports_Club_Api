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
        required: true,
      },
    },
  },
  { timestamps: true }
);

export const Innings = mongoose.model<IInningType>("Innings", inningsSchema);
