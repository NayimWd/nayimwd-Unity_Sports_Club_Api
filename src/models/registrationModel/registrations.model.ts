import mongoose, { Schema } from "mongoose";
import { IRegistration } from "../../utils/types/SchemaTypes";

const registrationSchema: Schema<IRegistration> = new Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    teamtId: {
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
    comments: {
      type: String,
      max: 250,
      min: 10,
    },
    status: {
      type: String,
      enum: ["pending", "approve", "rejected", "withdrawn"],
    },
  },
  {
    timestamps: true,
  }
);

// converting Date.now() to readable format
registrationSchema.virtual("DD/MM/YYYY").get(function () {
  return this.applicationDate?.toLocaleDateString();
});
// enable vertual
registrationSchema.set("toJSON", { virtuals: true });

export const Registration = mongoose.model<IRegistration>(
  "Registration",
  registrationSchema
);
