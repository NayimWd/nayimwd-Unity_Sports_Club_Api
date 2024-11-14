import { User } from "../../models/userModel/user.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const changeRole = asyncHandler(async (req, res) => {
 // get user id
 const {userId} = req.params;
 if(!userId){
    
 }
 // get role
  const { role } = req.body;
  if (!role) {
    throw new ApiError(400, "role is required");
  }
 
// update role
const updateRole = await User.findByIdAndUpdate(
  userId,
  {
    $set: {
      role: role
    }
  },
  {
    new: true, runValidators: true
  }
)

if(!updateRole){
  throw new ApiError(400, "Product update failed");
};

return res
         .status(200)
         .json(
          new ApiResponse(
            200,
            updateRole,
            "user role updated successfully"
          )
         )


});
