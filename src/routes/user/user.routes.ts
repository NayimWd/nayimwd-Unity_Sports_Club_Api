import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../../controller/user";
import { upload } from "../../middleware/multer.middleware";
import { veryfyJWT } from "../../middleware/auth.middleware";

const router = Router();

interface IUserRoutes {
  register: "/register";
  login: "/login";
  logout: "/logout";
  refreshToken: "/refreshToken"
}

const user_routes: IUserRoutes = {
  register: "/register",
  login: "/login",
  logout: "/logout",
  refreshToken: "/refreshToken"
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
router.route(user_routes.refreshToken).post(refreshAccessToken)

export default router;
