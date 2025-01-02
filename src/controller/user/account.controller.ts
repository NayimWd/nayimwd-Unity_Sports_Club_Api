import { User } from "../../models/userModel/user.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const updateAccount = asyncHandler(async (req, res) => {
  // Get user from request
  const user = (req as any).user;
  if (!user || !user._id) {
    throw new ApiError(400, "Invalid token, user not found");
  }

  // Get update fields from request body
  const { name, phoneNumber, role } = req.body;

  if (!name && !phoneNumber && !role) {
    throw new ApiError(400, "Details are missing for updating account details");
  }

  // Validate role if provided
  if (role && (role === "admin" || role === "staff")) {
    throw new ApiError(401, "Choose role as player, umpire, or manager");
  }

  // Prevent request with the same data
  if (
    (name && user.name === name) &&
    (phoneNumber && user.phoneNumber === phoneNumber) &&
    (role && user.role === role)
  ) {
    throw new ApiError(400, "Data already exists");
  }

  // Build update object dynamically
  const updateFields: Partial<{ name: string; phoneNumber: string; role: string }> = {};
  if (name && user.name !== name) updateFields.name = name;
  if (phoneNumber && user.phoneNumber !== phoneNumber) updateFields.phoneNumber = phoneNumber;
  if (role && user.role !== role) updateFields.role = role;

  // Find and update user
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { $set: updateFields },
    { new: true }
  ).select("-password");

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      updatedUser,
      "Account details updated successfully"
    )
  );
});
