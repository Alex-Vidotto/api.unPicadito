import { Router } from "express";
import { getSalasController, postSalaController } from "./sala.controller";
import { authenticateJWT } from "../../middlewares/auth.middleware";
import { validateMiddleware, catchAsync } from "../../middlewares/validate.middleware"; 
import { buscarSalasQuerySchema, crearSalaBodySchema } from "./sala.schema";

const router = Router();

// Endpoint: GET /api/salas/buscar
router.get(
    "/buscar",
    authenticateJWT, 
    validateMiddleware(buscarSalasQuerySchema, 'query'), 
    catchAsync(getSalasController) 
);

// Endpoint: POST /api/salas
router.post(
    "/",
    authenticateJWT,
    validateMiddleware(crearSalaBodySchema, 'body'),
    catchAsync(postSalaController)
);

export default router;