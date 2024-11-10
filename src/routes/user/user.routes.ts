import { Router } from "express";
import { registerUser } from "../../controller/user";
import { upload } from "../../middleware/multer.middleware";


const router = Router();

interface IUserRoutes {
    register: "/register"
}

const user_routes: IUserRoutes = {
    register: "/register"
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

export default router;