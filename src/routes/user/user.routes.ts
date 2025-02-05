import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  getAllUsers,
  getCurrentUser,
  updateAccount,
  changePassword,
  updateUserPhoto,
  forgetPassword,
  resetPassword,
  adminChangeRole,
} from "../../controller/user";
import { upload } from "../../middleware/multer.middleware";
import { isAdmin, veryfyJWT } from "../../middleware/auth.middleware";

const router = Router();

type UserRoutes = {
  register: "/register";
  login: "/login";
  logout: "/logout";
  refreshToken: "/refreshToken";
  all_users: "/all_users";
  current_user: "/current_user";
  update_account: "/update_account";
  change_role: "/change_role/:userId";
  photo: "/photo";
  change_password: "/change_password";
  forgot_password: "/forgot_password";
  reset_password: "/reset_password/:token";
}

const user_routes: UserRoutes = {
  register: "/register",
  login: "/login",
  logout: "/logout",
  refreshToken: "/refreshToken",
  all_users: "/all_users",
  current_user: "/current_user",
  update_account: "/update_account",
  change_role: "/change_role/:userId",
  photo: "/photo",
  change_password: "/change_password",
  forgot_password: "/forgot_password",
  reset_password: "/reset_password/:token",
};

// routes
// reister routes
router.route(user_routes.register).post(
  upload.fields([
    {
      name: "photo",
      maxCount: 1,
    },
  ]),
  registerUser
);
// login route
router.route(user_routes.login).post(loginUser);
// logout route
router.route(user_routes.logout).post(veryfyJWT, logoutUser);
// refresh access token
router.route(user_routes.refreshToken).post(refreshAccessToken);
// get all user
router.route(user_routes.all_users).get(veryfyJWT, isAdmin, getAllUsers);
// get current user
router.route(user_routes.current_user).get(veryfyJWT, getCurrentUser);
// update user details
router.route(user_routes.update_account).patch(veryfyJWT, updateAccount);
// change password
router.route(user_routes.change_password).patch(veryfyJWT, changePassword);
// update photo
router
  .route(user_routes.photo)
  .patch(veryfyJWT, upload.single("photo"), updateUserPhoto);
// change role
router
  .route(user_routes.change_role)
  .patch(veryfyJWT, isAdmin, adminChangeRole);
// forgot password
router.route(user_routes.forgot_password).post(veryfyJWT, forgetPassword);
// reset password
router.route(user_routes.reset_password).post(veryfyJWT, resetPassword);

export default router;
