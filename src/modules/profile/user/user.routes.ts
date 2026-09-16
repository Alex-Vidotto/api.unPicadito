import { Router } from 'express';
import * as userController from "./user.controller";
// import { verifyToken } from "../../middlewares/auth.middleware"; 
//Descomentar e importar cuando tenga el middleware 
const router = Router();

// Ruta para obtener el perfil del usuario autenticado
// GET /api/users/profile
// Para el middleware de autenticación modificar a: 
// router.get("/profile", verifyToken, userController.getUserProfile);
router.get("/profile", userController.getUserProfile);

export default router;
