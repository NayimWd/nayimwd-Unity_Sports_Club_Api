import mongoose, { Schema } from "mongoose";
import { IVenueBooking } from "../../utils/types/SchemaTypes";

const venueBookingSchema: Schema<IVenueBooking> = new Schema({
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
        type: Date,
        required: [true, "Booking date is required"],
    },
    startTime: {
        type: String,
        required: [true, "Start time is required"],
    },
    endTime: {
        type: String,
        required: [true, "End time is required"],
    }
},
    {
        timestamps: true,
    }
);

export const VenueBooking = mongoose.model<IVenueBooking>("VenueBooking", venueBookingSchema);