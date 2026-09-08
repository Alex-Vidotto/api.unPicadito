import { Router } from 'express';
import * as userController from "./user.controller";
const router = Router();
//GET /api/users
// en frontend: fetch('/api/users?nombre=manuComandante')
router.get("/", userController.searchPlayers);
export default router;
