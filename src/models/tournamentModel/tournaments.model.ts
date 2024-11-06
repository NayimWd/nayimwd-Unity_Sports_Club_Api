import mongoose, { Schema } from "mongoose";
import { ITournament } from "../../utils/types/SchemaTypes";

const tournamentSchema: Schema<ITournament> = new Schema({
  tournamentName: {
    type: String,
    required: [true, "tournament name is required"],
  },
  tournamentType: {
    type: String,
    enum: ["knockout", "series", "1v1"],
    required: true,
  },
  description: {
    type: String,
    required: true,
    max: 400,
    min: 20,
  },
  format: {
    type: String,
    enum: ["8 teams", "16 teams"],
    required: true,
  },
  ballType: {
    type: String,
    enum: ["tape tennis", "3 star", "leather"],
    default: "tape tennis",
  },
  matchOver: {
    type: String,
    required: true,
  },
  registrationDeadline: {
    type: Date,
    required: [true, "Registration deadline is required"],
  },
  seats: {
    type: String,
    enum: ["16", "8", "2", "3"],
    required: true,
  },
  startDate: {
    type: Date,
    required: [true, "tournament starting date is required"],
  },
  endDate: {
    type: Date,
    required: [true, "tournament end date is required"],
  },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Venue",
    required: [true, "Venue is required"],
  },
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed"],
    default: "upcoming",
  },
  entryFee: {
    type: Number,
    required: [true, "Entry Fee is required"],
  },
  prize: {
    champion: {
      type: String,
      required: [true, "Champion prize is required"],
    },
    runnerUp: {
      type: String,
      required: [true, "RunnerUp prize is required"],
    },
    thirdPlace: {
      type: String,
    },
  },
  photo: {
    type: String,
  },
});

export const Tournament = mongoose.model<ITournament>(
  "Tournament",
  tournamentSchema
);
