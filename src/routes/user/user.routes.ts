import { Router } from "express";
import { loginUser, registerUser } from "../../controller/user";
import { upload } from "../../middleware/multer.middleware";


const router = Router();

interface IUserRoutes {
    register: "/register"
    login: "/login"
}

const user_routes: IUserRoutes = {
    register: "/register",
    login: "/login"
}

// routes
// reister routes
router.route(user_routes.register).post(
    upload.fields([
        {
            name: "photo",
            maxCount: 1
        }
    ]),
    registerUser
)
// login route
router.route(user_routes.login).post(loginUser)

export default router;