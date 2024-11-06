import mongoose, { Schema } from "mongoose";
import { IPoint } from "../../utils/types/SchemaTypes";

const pointTableSchema: Schema<IPoint> = new Schema({
  tournameId: {
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
  },
  wins: {
    type: Number,
    required: true,
  },
  losses: {
    type: Number,
    required: true,
  },
  ties: {
    type: Number,
    required: true,
  },
  points: {
    type: Number,
    required: true,
  },
});

export const PointTable = mongoose.model<IPoint>(
  "PointTable",
  pointTableSchema
);
