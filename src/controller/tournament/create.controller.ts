import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";

export const createTournament = asyncHandler(async (req, res) => {
    // auth check for admin or staff
    const creator = (req as any).user;
    if (!creator) {
        throw new ApiError(401, "Unauthorized request, please login");
    };
    // check if user is admin or staff
    if (creator.role !== "admin" && creator.role !== "staff") {
        throw new ApiError(403, "Unauthorized request, you are not allowed to create tournament");
    };

    // get data from request body
    const {} = req.body;

});