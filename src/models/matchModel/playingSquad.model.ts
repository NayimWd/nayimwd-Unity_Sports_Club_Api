import mongoose, { Schema } from "mongoose";
import { IPlayingSquad } from "../../utils/types/SchemaTypes";

const PlayingSquadSchema = new Schema<IPlayingSquad>(
  {
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    matchId: { type: Schema.Types.ObjectId, ref: "Match", required: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    players: {
      type: [{ type: Schema.Types.ObjectId, ref: "TeamPlayer" }],
      validate: {
        validator: function (v: mongoose.Types.ObjectId[]) {
          return v.length === 11;
        },
        message: "Playing squad must contain exactly 11 players.",
      },
      required: true,
    },
    captain: {
      type: Schema.Types.ObjectId,
      ref: "TeamPlayer",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const PlayingSquad = mongoose.model<IPlayingSquad>(
  "PlayingSquad",
  PlayingSquadSchema
);
