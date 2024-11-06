import mongoose, { Schema } from "mongoose";
import { ITournamentResult } from "../../utils/types/SchemaTypes";

const tournamentResultSchema: Schema<ITournamentResult> = new Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    result: {
      champion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true,
      },
      runnerUp: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true,
      },
      thirdPlace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
    },
    manOfTheTournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    awardFor: {
      type: String,
      required: true,
    },
    photo: String,
  },
  {
    timestamps: true,
  }
);

export const TournamentResult = mongoose.model<ITournamentResult>(
  "TournamentResult",
  tournamentResultSchema
);
