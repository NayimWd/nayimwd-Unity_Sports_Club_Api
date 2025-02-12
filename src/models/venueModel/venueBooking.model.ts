import mongoose, { Schema } from "mongoose";
import { IVenueBooking } from "../../utils/types/SchemaTypes";

const venueBookingSchema: Schema<IVenueBooking> = new Schema(
  {
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: [true, "Venue is required"],
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    bookingDate: {
      type: String,
      required: [true, "Booking date is required"],
      validate: {
        validator: function (value: string) {
          return /^\d{2}-\d{2}-\d{4}$/.test(value); // Matches format like "22-01-2025"
        },
        message: "Date must be in the format DD-MM-YYYY.",
      },
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      validate: {
        validator: function (value: string) {
          return /^(1[0-2]|0?[1-9])(am|pm)$/.test(value.toLowerCase()); // Matches format like "2pm"
        },
        message: "Start time must be in the format h(am/pm).",
      },
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      validate: {
        validator: function (value: string) {
          return /^(1[0-2]|0?[1-9])(am|pm)$/.test(value.toLowerCase()); // Matches format like "3pm"
        },
        message: "End time must be in the format h(am/pm).",
      },
    },
  },
  {
    timestamps: true,
  }
);

venueBookingSchema.index(
  { venueId: 1, bookingDate: 1, startTime: 1, endTime: 1 },
  { unique: true }
);

export const VenueBooking = mongoose.model<IVenueBooking>(
  "VenueBooking",
  venueBookingSchema
);
