import { Router } from "express";
import { UserController } from "./user.controller";
import { validateSchema } from "../../middlewares/validate.middleware";
import { registerSchema, loginSchema } from "./user.schema";

const router = Router();
const userController = new UserController();

router.post("/register", validateSchema(registerSchema), userController.register);
router.post("/login", validateSchema(loginSchema), userController.login);

export default router;