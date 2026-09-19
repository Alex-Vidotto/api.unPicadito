import { Router } from 'express';
import * as userController from "./user.controller";
import { validateSchema } from '../../middlewares/validate.middleware';
import { registerSchema, loginSchema } from './user.schema';
import { authenticateJWT } from "../../middleware/auth.middleware"; 

const router = Router();

// POST /api/users/register
router.post("/register", validateSchema(registerSchema), userController.register);

// POST /api/users/login
router.post("/login", validateSchema(loginSchema), userController.login);

//GET /api/users
// en frontend: fetch('/api/users?nombre=manuComandante')
router.get("/", userController.searchPlayers);

// Mi perfil privado
router.get("/me", authenticateJWT, userController.getUserProfile);

router.get("/:id", userController.getPublicProfile);

export default router;