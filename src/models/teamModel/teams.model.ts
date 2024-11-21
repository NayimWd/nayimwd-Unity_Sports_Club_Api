import mongoose, { Schema } from "mongoose";
import { ITeams } from "../../utils/types/SchemaTypes";

const teamSchema: Schema<ITeams> = new Schema({
  teamName: {
    type: String,
    required: [true, "Team name is required"],
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  playerCount: {
    type: Number,
    default: 0,
    max: 18,
  },
  status: {
    type: String,
    enum: ["active", "disqualified"],
  },
  teamLogo: {
    type: String,
  },
}, {
    timestamps: true
});


export const Team = mongoose.model<ITeams>("Team", teamSchema)