import mongoose, { Schema } from "mongoose";
import { IPoint } from "../../utils/types/SchemaTypes";

const pointTableSchema: Schema<IPoint> = new Schema({
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
  matchPlayed: {
    type: Number,
    required: true,
    min: [0, "Match played can not be negative."],
    validate: {
      validator: function () {
        return (
          this.matchPlayed ===
          (this.wins ?? 0) + (this.losses ?? 0) + (this.ties ?? 0)
        );
      },
      message: "Match played should be equal to sum of wins, losses and ties.",
    },
  },
  wins: {
    type: Number,
    required: true,
    min: [0, "Wins can not be negative."],
    default: 0,
  },
  losses: {
    type: Number,
    required: true,
    min: [0, "Losses can not be negative."],
    default: 0,
  },
  ties: {
    type: Number,
    required: true,
    min: [0, "Ties can not be negative."],
    default: 0,
  },
  points: {
    type: Number,
    required: true,
    min: [0, "Points can not be negative."],
    default: 0,
  },
});

export const PointTable = mongoose.model<IPoint>(
  "PointTable",
  pointTableSchema
);
