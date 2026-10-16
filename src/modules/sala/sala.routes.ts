import { Router } from "express";
import * as salaController from "./sala.controller";
import { authenticateJWT } from "../../middlewares/auth.middleware";
import { validateMiddleware } from "../../middlewares/validate.middleware";
import {
    buscarSalasQuerySchema,
    cambiarEstadoSalaBodySchema,
    crearSalaBodySchema,
    editarSalaBodySchema,
    expulsarJugadorSchema,
    salaIdParamsSchema,
    transferirOrganizadorBodySchema,
    aceptarSolicitudParamsSchema,
} from "./sala.schema";



const router = Router();

router.get(
    "/buscar",
    authenticateJWT,
    validateMiddleware(buscarSalasQuerySchema, "query"),
    salaController.buscar,
);

router.get(
    "/:id",
    authenticateJWT,
    validateMiddleware(salaIdParamsSchema, "params"),
    salaController.obtenerPorId,
);

router.post(
    "/",
    authenticateJWT,
    validateMiddleware(crearSalaBodySchema, "body"),
    salaController.crear,
);

router.post(
    "/:id/unirse",
    authenticateJWT,
    validateMiddleware(salaIdParamsSchema, "params"),
    salaController.unirse,
);

router.delete(
    "/:id/salir",
    authenticateJWT,
    validateMiddleware(salaIdParamsSchema, "params"),
    salaController.salir,
);

router.patch(
    "/:id/cancelar",
    authenticateJWT,
    validateMiddleware(salaIdParamsSchema, "params"),
    validateMiddleware(cambiarEstadoSalaBodySchema, "body"),
    salaController.cancelar,
);

router.delete(
    "/:id/expulsar/:userId",
    authenticateJWT,
    validateMiddleware(expulsarJugadorSchema, "params"),
    salaController.expulsarJugador,
);

router.patch(
    "/:id",
    authenticateJWT,
    validateMiddleware(salaIdParamsSchema, "params"),
    validateMiddleware(editarSalaBodySchema, "body"),
    salaController.editar,
);

router.patch(
    "/:id/transferir-organizador",
    authenticateJWT,
    validateMiddleware(salaIdParamsSchema, "params"),
    validateMiddleware(transferirOrganizadorBodySchema, "body"),
    salaController.transferirOrganizador,
);

router.patch(
    "/:id/solicitudes/:participacionId/aceptar",
    authenticateJWT,
    validateMiddleware(aceptarSolicitudParamsSchema, "params"),
    salaController.aceptarSolicitudController
);

export default router;
