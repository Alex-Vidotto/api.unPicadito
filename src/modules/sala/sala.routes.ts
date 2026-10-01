import { Router } from "express";
import { getSalasController, postSalaController, cambiarEstadoSalaController, unirseSalaController, leaveSalaController, expulsarJugadorController} from "./sala.controller";
import { authenticateJWT } from "../../middlewares/auth.middleware";
import { validateMiddleware } from "../../middlewares/validate.middleware"; 
import { buscarSalasQuerySchema, crearSalaBodySchema, cambiarEstadoSalaBodySchema, leaveSalaSchema, expulsarJugadorSchema } from "./sala.schema";

const router = Router();

// Endpoint: GET /api/salas/buscar
router.get(
    "/buscar",
    authenticateJWT,
    validateMiddleware(buscarSalasQuerySchema, 'query'), 
    getSalasController 
);

// Endpoint: POST /api/salas
router.post(
    "/",
    authenticateJWT,
    validateMiddleware(crearSalaBodySchema, 'body'),
    postSalaController
);

router.post(
    "/:id/unirse",
    authenticateJWT,
    validateMiddleware(leaveSalaSchema, 'params'),
    unirseSalaController
);

router.delete(
    "/:id/salir",
    authenticateJWT,
    validateMiddleware(leaveSalaSchema, 'params'),
    leaveSalaController
);

router.patch(
    "/:id/cancelar",
    authenticateJWT,
    validateMiddleware(cambiarEstadoSalaBodySchema, 'body'),
    cambiarEstadoSalaController
);


router.delete(
    "/:id/expulsar/:userId",
    authenticateJWT, 
    validateMiddleware(expulsarJugadorSchema, 'params'), 
    expulsarJugadorController
);

export default router;