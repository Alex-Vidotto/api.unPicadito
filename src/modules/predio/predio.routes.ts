import { Router } from "express";
import * as predioController from "./predio.controller";
import { validateMiddleware } from "../../middlewares/validate.middleware";
import { buscarPrediosCercanosSchema, predioIdParamsSchema } from "./predio.schema";

const router = Router();

router.get("/cercanos", validateMiddleware(buscarPrediosCercanosSchema, "query"), predioController.buscarCercanos);
router.get("/:id/canchas", validateMiddleware(predioIdParamsSchema, "params"), predioController.obtenerCanchas);

export default router;
