import mongoose, { Schema } from "mongoose";
import { IRegistration } from "../../utils/types/SchemaTypes";

const registrationSchema: Schema<IRegistration> = new Schema(
  {
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
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicationDate: {
      type: Date,
      default: Date.now(),
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "withdrawn"],
      default: "pending",
    },
  },
  {
    timestamps: true, 
  }
);

// Unique index to prevent duplicate registrations for the same team and tournament
registrationSchema.index({ tournamentId: 1, teamId: 1 }, { unique: true });

// Virtual property for formatted application date
registrationSchema.virtual("formattedApplicationDate").get(function () {
  return this.applicationDate?.toLocaleDateString("en-GB"); // Returns in DD/MM/YYYY format
});

// Enable virtuals in JSON output
registrationSchema.set("toJSON", { virtuals: true });

export const Registration = mongoose.model<IRegistration>(
  "Registration",
  registrationSchema
);
