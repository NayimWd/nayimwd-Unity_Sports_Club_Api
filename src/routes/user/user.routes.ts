import { Router } from "express";
import { registerUser } from "../../controller/user";


const router = Router();

interface IUserRoutes {
    register: "/register"
}

const user_routes: IUserRoutes = {
    register: "/register"
}

// routes
// reister routes
router.route(user_routes.register).post(registerUser)

export default router;