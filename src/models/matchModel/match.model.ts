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
        validator: function (team) {
          return team.length === 2; // Ensure exactly 2 teams
        },
        message: "A match must have exactly 2 teams.",
      },
      required: [true, "Teams are required"],
    },
    date: {
      type: Date,
      required: [true, "match date is required"],
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
