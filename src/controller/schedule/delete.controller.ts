import { Schedule } from "../../models/sceduleModel/schedules.model";
import { VenueBooking } from "../../models/venueModel/venueBooking.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const deleteSchedule = asyncHandler(async(req, res)=>{
    // authentication
    const author = (req as any).user;
    // check if the user is an admin or staff
    if(!author || !["admin", "staff"].includes(author.role)){
        throw new ApiError(403, "You are not authorized to delete the schedule");
    };

    // get the schedule id from the request params
    const {scheduleId} = req.params;

    // check data

    if(!scheduleId){
        throw new ApiError(400, "Please provide schedule id");
    };

    // find the schedule
    const schedule = await Schedule.findById(scheduleId);
    if(!schedule){
        throw new ApiError(404, "Schedule not found");
    };

    // cancel venue booking
    await VenueBooking.findOneAndDelete({
        venueId: schedule.venueId,
        bookingDate: schedule.matchDate,
        startTime: schedule.matchTime
    })

    // delete the schedule
   await Schedule.findByIdAndDelete(scheduleId);

    // return response
    res.status(200).json(
        new ApiResponse(200, null ,"Schedule deleted")
    )

});