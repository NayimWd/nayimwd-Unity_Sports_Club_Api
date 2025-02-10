import { Schedule } from "../../models/sceduleModel/schedules.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import moment from "moment";

export const updateStatus = asyncHandler(async(req, res)=>{
    // authentication 
    const author = (req as any).user;
    // check if the user is an admin or staff
    if(author || !["admin", "staff"].includes(author.role)){
        throw new ApiError(403, "You are not authorized to change the schedule");
    };

    // get the schedule id and status from the request params and body 
    const {scheduleId} = req.params;
    const {status} = req.body;

    // check data
    if(!scheduleId || !status){
        throw new ApiError(400, "Please provide schedule id and status");
    };

    // validate status
    const validStatus = ["scheduled", "rescheduled", "in-progress", "cancelled", "completed"];
    if(!validStatus.includes(status)){
        throw new ApiError(400, "Invalid status");
    };

    // find the schedule
    const schedule = await Schedule.findById(scheduleId);
    if(!schedule){
        throw new ApiError(404, "Schedule not found");
    };

    // convert the match date and time to a moment object
    const matchStart = moment(`${schedule.matchDate} ${schedule.matchTime}`, "DD-MM-YYYY hA");

    const now = moment();

    // prevent invalid status changes
    if(now.isAfter(matchStart) && status === "scheduled"){
        throw new ApiError(400, "Cannot set status to scheduled after match time.");
    }

    if(now.isBefore(matchStart) && status === "in-progress"){
        throw new ApiError(400, "Match has not started yet.");
    }

    // update the status
    schedule.status = status;
    await schedule.save();

    // return response
    res.status(200).json(
        new ApiResponse(200, schedule.status ,"Schedule status updated")
    )
})