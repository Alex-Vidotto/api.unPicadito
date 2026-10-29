import { Router } from "express";
import * as userController from "./user.controller";
import { validateMiddleware } from "../../middlewares/validate.middleware";
import { registerSchema, loginSchema, userIdParamSchema, searchUserQuerySchema, updateProfileSchema } from "./user.schema";
import { authenticateJWT } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/register", validateMiddleware(registerSchema, "body"), userController.register);
router.post("/login", validateMiddleware(loginSchema, "body"), userController.login);
router.get("/", validateMiddleware(searchUserQuerySchema, "query"), userController.searchPlayers);
router.get("/me", authenticateJWT, userController.getUserProfile);
router.patch("/me", authenticateJWT, validateMiddleware(updateProfileSchema, "body"), userController.updateProfile);
router.get("/:id", validateMiddleware(userIdParamSchema, "params"), userController.getPublicProfile);

export default router;
