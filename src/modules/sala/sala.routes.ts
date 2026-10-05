import { Router } from "express";
import * as salaController from "./sala.controller";
import { authenticateJWT } from "../../middlewares/auth.middleware";
import { validateMiddleware } from "../../middlewares/validate.middleware";
import { buscarSalasQuerySchema, crearSalaBodySchema, cambiarEstadoSalaBodySchema, salaIdParamsSchema, expulsarJugadorSchema, editarSalaBodySchema } from "./sala.schema";

const router = Router();

// Endpoint: GET /api/salas/buscar
router.get(
    "/buscar",
    authenticateJWT,
    validateMiddleware(buscarSalasQuerySchema, "query"),
    salaController.buscar
);

// Endpoint: GET /api/salas/:id
router.get(
    "/:id",
    authenticateJWT,
    validateMiddleware(salaIdParamsSchema, "params"),
    salaController.obtenerPorId
);

// Endpoint: POST /api/salas
router.post(
    "/",
    authenticateJWT,
    validateMiddleware(crearSalaBodySchema, "body"),
    salaController.crear
);

// Endpoint: POST /api/salas/:id/unirse
router.post(
    "/:id/unirse",
    authenticateJWT,
    validateMiddleware(salaIdParamsSchema, "params"),
    salaController.unirse
);

// Endpoint: DELETE /api/salas/:id/salir
router.delete(
    "/:id/salir",
    authenticateJWT,
    validateMiddleware(salaIdParamsSchema, "params"),
    salaController.salir
);

// Endpoint: PATCH /api/salas/:id/cancelar
router.patch(
    "/:id/cancelar",
    authenticateJWT,
    validateMiddleware(salaIdParamsSchema, "params"), // valida que el id sea un UUID
    validateMiddleware(cambiarEstadoSalaBodySchema, "body"),
    salaController.cancelar
);

// Endpoint: DELETE /api/salas/:id/expulsar/:userId
router.delete(
    "/:id/expulsar/:userId",
    authenticateJWT,
    validateMiddleware(expulsarJugadorSchema, "params"),
    salaController.expulsarJugador
);

// Endpoint: PATCH /api/salas/:id
router.patch(
    "/:id",
    authenticateJWT,
    validateMiddleware(salaIdParamsSchema, "params"), // valida que el id sea un UUID
    validateMiddleware(editarSalaBodySchema, "body"),
    salaController.editar
);

export default router;