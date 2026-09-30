import { CrearSalaBody, EliminarSalaBody, buscarSalasQuerySchema } from "./sala.schema";
import { buscarSalas, crearSalaService, cambiarEstadoSalaService, unirseSalaService, leaveSalaService } from "./sala.service";
import { asyncHandler } from "../../middlewares/error.middleware";
import { obtenerIdParam, obtenerUserId } from "../../common/request.helpers";

export const getSalasController = asyncHandler(async (req, res) => {
    const filtros = buscarSalasQuerySchema.parse(req.query);
    const salas = await buscarSalas(filtros, obtenerUserId(req));

    res.status(200).json({ success: true, data: salas });
});

export const postSalaController = asyncHandler(async (req, res) => {
    const data = req.body as CrearSalaBody;
    const nuevaSala = await crearSalaService(data, obtenerUserId(req));

    res.status(201).json({ success: true, data: nuevaSala });
});

export const cambiarEstadoSalaController = asyncHandler(async (req, res) => {
    const { motivoCancelacion } = req.body as EliminarSalaBody;
    const resultado = await cambiarEstadoSalaService(obtenerIdParam(req), obtenerUserId(req), motivoCancelacion);

    res.status(200).json({ success: true, data: resultado });
});

export const unirseSalaController = asyncHandler(async (req, res) => {
    const resultado = await unirseSalaService(obtenerIdParam(req), obtenerUserId(req));

    res.status(200).json({ success: true, data: resultado });
});

export const leaveSalaController = asyncHandler(async (req, res) => {
    const resultado = await leaveSalaService(obtenerIdParam(req), obtenerUserId(req));

    res.status(200).json({ success: true, data: resultado });
});