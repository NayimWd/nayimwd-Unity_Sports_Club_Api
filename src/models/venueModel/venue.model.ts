import mongoose, { Schema } from "mongoose";
import { IVenue } from "../../utils/types/SchemaTypes";

const venueSchema: Schema<IVenue> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Venue name is required"],
    },
    location: {
      type: String,
      required: [true, "Venue location is required"],
    },
    bookingSlot: [
      {
        date: {
          type: Date,
          required: [true, "vanue booking date is required"],
        },
        startTime: {
          type: String,
          required: [true, "Start time is required"],
        },
        endTime: {
          type: String,
          required: [true, "Approx End time is required"],
        },
      },
    ],
    photo: String,
  },
  {
    timestamps: true,
  }
);

export const Venue = mongoose.model<IVenue>("Venue", venueSchema);
