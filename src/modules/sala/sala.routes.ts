import { Router } from "express";
import { getSalasController, postSalaController, cancelarSalaController } from "./sala.controller";
import { authenticateJWT } from "../../middlewares/auth.middleware";
import { validateMiddleware, catchAsync } from "../../middlewares/validate.middleware"; 
import { buscarSalasQuerySchema, crearSalaBodySchema, cancelarSalaBodySchema } from "./sala.schema";

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
    validateMiddleware(cancelarSalaBodySchema, 'body'),
    cancelarSalaController
);

export default router;