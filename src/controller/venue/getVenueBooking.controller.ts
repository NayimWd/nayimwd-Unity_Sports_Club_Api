import { VenueBooking } from "../../models/venueModel/venueBooking.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const getVenueBooking = asyncHandler(async (req, res) => {
    // Authentication
    const author = (req as any).user;
    
    // Check if the user is an admin or staff
    if (!author || !["admin", "staff"].includes(author.role)) {
        throw new ApiError(403, "You are not authorized to view venue bookings");
    }
    
    // Get the venue venue ID from the request params
    const {  venueId } = req.params;
    
    // Validate input
    if (!venueId) {
        throw new ApiError(400, "Please provide a valid booking ID.");
    }
    
    // Find the venue booking
    const booking = await VenueBooking.findById(venueId);
    if (!booking) {
        throw new ApiError(404, "Venue booking not found");
    }
    
    // Return response
    res.status(200).json(new ApiResponse(200, booking, "Venue booking retrieved successfully."));
});