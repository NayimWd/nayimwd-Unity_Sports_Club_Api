import { registerUser } from "./registerUser.controller";
import { loginUser } from "./login.controller";
import { logoutUser } from "./logout.controller";
import { refreshAccessToken } from "./refreshToken.controller";
import { getAllUsers, getCurrentUser } from "./getUsers.controller";
import { updateAccount } from "./account.controller";
import { changePassword } from "./password.controller";
import { updateUserPhoto } from "./userPhoto.controller";
import { forgetPassword, resetPassword } from "./forgetPassword.controller";
import { changeRole } from "./role.controller";

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getAllUsers,
  getCurrentUser,
  updateAccount,
  changePassword,
  updateUserPhoto,
  changeRole,
  forgetPassword,
  resetPassword,
};
