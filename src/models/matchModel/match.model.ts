import mongoose, { Schema } from "mongoose";
import { IMatchTeype } from "../../utils/types/SchemaTypes";

const matchSchema: Schema<IMatchTeype> = new Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    teams: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Team",
          required: true,
        },
      ],
      validate: {
        validator: function (teams: mongoose.Schema.Types.ObjectId[]) {
          return teams.length === 2; // Ensure exactly 2 teams
        },
        message: "A match must have exactly 2 teams.",
      },
      required: [true, "Teams are required"],
    },
    date: {
      type: String,
      required: [true, "Match date is required"],
      validate: {
        validator: function (value: string) {
          return /^\d{2}-\d{2}-\d{4}$/.test(value); // Format: DD-MM-YYYY
        },
        message: "Match date must be in the format DD-MM-YYYY.",
      },
    },
    time: {
      type: String,
      required: [true, "Match time is required"],
      validate: {
        validator: function (value: string) {
          return /^(1[0-2]|0?[1-9])(am|pm)$/.test(value.toLowerCase()); // Format: h(am/pm)
        },
        message: "Match time must be in the format h(am/pm).",
      },
    },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "live", "completed"],
      default: "upcoming",
    },
    umpires: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    photo: String,
  },
  {
    timestamps: true,
  }
);

export const Match = mongoose.model<IMatchTeype>("Match", matchSchema);
