import mongoose, { Schema } from "mongoose";
import { ITournament } from "../../utils/types/SchemaTypes";

const tournamentSchema: Schema<ITournament> = new Schema(
  {
    tournamentName: {
      type: String,
      required: [true, "Tournament name is required"],
    },
    tournamentType: {
      type: String,
      enum: ["knockout", "series", "1v1", "points"],
      required: [true, "Invalid tournament type"],
    },
    description: {
      type: String,
      required: true,
      max: [400, "Description cannot exceed 400 characters"],
      min: [20, "Description must be at least 20 characters long"],
    },
    format: {
      type: Number,
      enum: [4, 6, 8, 12, 16],
      required: [true, "Invalid format"],
    },
    ballType: {
      type: String,
      enum: ["tape tennis", "3 star", "leather"],
      default: "tape tennis",
    },
    matchOver: {
      type: Number,
      required: true,
    },
    registrationDeadline: {
      type: String,
      required: [true, "Registration deadline is required"],
      validate: {
        validator: function (value: string) {
          return /^\d{2}-\d{2}-\d{4}$/.test(value); // Format: DD-MM-YYYY
        },
        message: "Registration deadline must be in the format DD-MM-YYYY.",
      },
    },
    startDate: {
      type: String,
      required: [true, "Tournament start date is required"],
      validate: {
        validator: function (value: string) {
          return /^\d{2}-\d{2}-\d{4}$/.test(value); // Format: DD-MM-YYYY
        },
        message: "Start date must be in the format DD-MM-YYYY.",
      },
    },
    endDate: {
      type: String,
      required: [true, "Tournament end date is required"],
      validate: {
        validator: function (value: string) {
          return /^\d{2}-\d{2}-\d{4}$/.test(value); // Format: DD-MM-YYYY
        },
        message: "End date must be in the format DD-MM-YYYY.",
      },
    },
    seats: {
      type: Number,
    },
    teamCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"],
      default: "upcoming",
    },
    entryFee: {
      type: Number,
      required: [true, "Entry Fee is required"],
      min: [0, "Entry fee cannot be negative"],
    },
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
    photo: {
      type: String,
      required: [true, "Tournament Photo is required"],
    },
  },
  {
    timestamps: true,
  }
);

export const Tournament = mongoose.model<ITournament>(
  "Tournament",
  tournamentSchema
);
