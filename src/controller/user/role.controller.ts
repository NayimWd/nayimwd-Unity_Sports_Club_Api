import { User } from "../../models/userModel/user.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const adminChangeRole = asyncHandler(async (req, res) => {
  // permission for make admin
  const userRole = (req as any).user?.role;

  // filter admin
  if(userRole !== "admin"){
    throw new ApiError(
      409, "you are not unauthorized for change user role"
    )
  }
  
 // get user id
 const {userId} = req.params;
 if(!userId){
    throw new ApiError(400, "user id is required")
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

// user role change for update own role
export const changeMyRole = asyncHandler(async(req, res)=>{
  // get user id 
  const userId = (req as any).user.id;
  if(!userId){
    
  }
})