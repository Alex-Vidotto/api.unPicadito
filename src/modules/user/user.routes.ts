import { Router } from 'express';
import * as userController from "./user.controller";
import { validateMiddleware } from '../../middlewares/validate.middleware';
import { registerSchema, loginSchema } from './user.schema';


const router = Router();    

// POST /api/users/register
router.post("/register", validateMiddleware(registerSchema), userController.register);

// POST /api/users/login
router.post("/login", validateMiddleware(loginSchema), userController.login);

//GET /api/users
// en frontend: fetch('/api/users?nombre=manuComandante')
router.get("/", userController.searchPlayers);


export default router;