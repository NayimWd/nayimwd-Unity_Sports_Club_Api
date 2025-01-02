import mongoose, { Schema } from "mongoose";
import { ITeamPlayer } from "../../utils/types/SchemaTypes";

const teamPlayerSchema: Schema<ITeamPlayer> = new Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },
    playerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    isCaptain: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ["active", "benched", "injured"],
        default: "active"
    }
});

export const TeamPlayer = mongoose.model<ITeamPlayer>("TeamPlayer", teamPlayerSchema)