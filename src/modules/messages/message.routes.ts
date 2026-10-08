import {  Router } from "express";
import { MessageController } from "./message.controller";

const router = Router();
const controller = new MessageController();

// POST /api/messages
router.post("/", controller.createMessage);

// Ruta para que axios obtenga el historial
router.get("/:user1/:user2", controller.getHistory);

export default router;