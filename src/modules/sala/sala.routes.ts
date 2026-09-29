import { Router } from "express";
import { getSalasController, postSalaController, cambiarEstadoSalaController } from "./sala.controller";
import { authenticateJWT } from "../../middlewares/auth.middleware";
import { validateMiddleware, catchAsync } from "../../middlewares/validate.middleware"; 
import { buscarSalasQuerySchema, crearSalaBodySchema, cambiarEstadoSalaBodySchema } from "./sala.schema";

const router = Router();

// Endpoint: GET /api/salas/buscar
router.get(
    "/buscar",
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

router.patch(
    "/:id/cancelar",
    authenticateJWT,
    validateMiddleware(cambiarEstadoSalaBodySchema, 'body'),
    cambiarEstadoSalaController
);

export default router;