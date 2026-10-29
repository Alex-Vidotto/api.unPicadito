import { Router } from "express";
import * as salaController from "./sala.controller";
import { validateMiddleware } from "../../middlewares/validate.middleware";
import { buscarSalasQuerySchema, cambiarEstadoSalaBodySchema, crearSalaBodySchema, editarSalaBodySchema, expulsarJugadorSchema, salaIdParamsSchema, transferirOrganizadorBodySchema, aceptarSolicitudParamsSchema } from "./sala.schema";

const router = Router();

router.get("/buscar", validateMiddleware(buscarSalasQuerySchema, "query"), salaController.buscar);
router.get("/:id", validateMiddleware(salaIdParamsSchema, "params"), salaController.obtenerPorId);
router.post("/", validateMiddleware(crearSalaBodySchema, "body"), salaController.crear);
router.post("/:id/unirse", validateMiddleware(salaIdParamsSchema, "params"), salaController.unirse);
router.delete("/:id/salir", validateMiddleware(salaIdParamsSchema, "params"), salaController.salir);
router.patch("/:id/cancelar", validateMiddleware(salaIdParamsSchema, "params"), validateMiddleware(cambiarEstadoSalaBodySchema, "body"), salaController.cancelar);
router.delete("/:id/expulsar/:userId", validateMiddleware(expulsarJugadorSchema, "params"), salaController.expulsarJugador);
router.patch("/:id", validateMiddleware(salaIdParamsSchema, "params"), validateMiddleware(editarSalaBodySchema, "body"), salaController.editar);
router.patch("/:id/transferir-organizador", validateMiddleware(salaIdParamsSchema, "params"), validateMiddleware(transferirOrganizadorBodySchema, "body"), salaController.transferirOrganizador);
router.patch("/:id/solicitudes/:participacionId/aceptar", validateMiddleware(aceptarSolicitudParamsSchema, "params"), salaController.aceptarSolicitudController);
router.patch("/:id/solicitudes/:participacionId/rechazar", validateMiddleware(aceptarSolicitudParamsSchema, "params"), salaController.rechazarSolicitudController);

router.patch(
    "/:id/finalizar",
    validateMiddleware(salaIdParamsSchema, "params"),
    salaController.finalizar,
);
export default router;
