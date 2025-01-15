import mongoose, { Schema } from "mongoose";
import { IVenue } from "../../utils/types/SchemaTypes";

const venueSchema: Schema<IVenue> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Venue name is required"],
    },
    city: {
      type: String,
      required: [true, "Venue city is required"],
    },
    location: {
      type: String,
      required: [true, "Venue location is required"],
    },
    features: {
      type: String,
      enum: ["outdoor", "indoor", "floodlight"],
    },
    photo: String,
  },
  {
    timestamps: true,
  }
);

export const Venue = mongoose.model<IVenue>("Venue", venueSchema);
