import { Request, Response } from "express";
import { BuscarSalasQuery, CrearSalaBody, EliminarSalaBody, EditarSalaBody } from "./sala.schema";
import { buscarSalas, crearSalaService, cambiarEstadoSalaService, unirseSalaService, leaveSalaService, expulsarJugadorService, editarSalaService, obtenerDetalleSalaService } from "./sala.service";

// Nota: req.user!.id es seguro porque todas las rutas de sala pasan antes por authenticateJWT.
// Los datos de req.body / req.params / req.query ya llegan validados por validateMiddleware en sala.routes.ts.
// En el catch: si el error trae "status" es un error de negocio conocido (404, 403, 409);
// si no lo trae es inesperado y respondemos 500 sin exponer el detalle interno.

// GET /api/salas/buscar
export const buscar = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const filtros = req.query as unknown as BuscarSalasQuery;

        const salas = await buscarSalas(filtros, userId);
        res.status(200).json({ success: true, data: salas });
    } catch (error: any) {
        if (!error.status) console.error(error);
        res.status(error.status || 500).json({
            success: false,
            message: error.status ? error.message : "Error interno del servidor",
        });
    }
};

export const obtenerPorId = async (req: Request, res: Response): Promise<void> => {
    try {
        const salaId = req.params.id as string;
        const sala = await obtenerDetalleSalaService(salaId);
        res.status(200).json({ success: true, data: sala });
    } catch (error: any) {
        if (!error.status) console.error(error);
        res.status(error.status || 500).json({
            success: false,
            message: error.status ? error.message : "Error interno del servidor",
        });
    }
};

// POST /api/salas
export const crear = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const datos = req.body as CrearSalaBody;

        const nuevaSala = await crearSalaService(datos, userId);
        res.status(201).json({ success: true, data: nuevaSala });
    } catch (error: any) {
        if (!error.status) console.error(error);
        res.status(error.status || 500).json({
            success: false,
            message: error.status ? error.message : "Error interno del servidor",
        });
    }
};

// POST /api/salas/:id/unirse
export const unirse = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const salaId = req.params.id as string;

        const resultado = await unirseSalaService(salaId, userId);
        res.status(200).json({ success: true, data: resultado });
    } catch (error: any) {
        if (!error.status) console.error(error);
        res.status(error.status || 500).json({
            success: false,
            message: error.status ? error.message : "Error interno del servidor",
        });
    }
};

// DELETE /api/salas/:id/salir
export const salir = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const salaId = req.params.id as string;

        const resultado = await leaveSalaService(salaId, userId);
        res.status(200).json({ success: true, data: resultado });
    } catch (error: any) {
        if (!error.status) console.error(error);
        res.status(error.status || 500).json({
            success: false,
            message: error.status ? error.message : "Error interno del servidor",
        });
    }
};

// PATCH /api/salas/:id/cancelar
export const cancelar = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const salaId = req.params.id as string;
        const { motivoCancelacion } = req.body as EliminarSalaBody;

        const resultado = await cambiarEstadoSalaService(salaId, userId, motivoCancelacion);
        res.status(200).json({ success: true, data: resultado });
    } catch (error: any) {
        if (!error.status) console.error(error);
        res.status(error.status || 500).json({
            success: false,
            message: error.status ? error.message : "Error interno del servidor",
        });
    }
};

// DELETE /api/salas/:id/expulsar/:userId
export const expulsarJugador = async (req: Request, res: Response): Promise<void> => {
    try {
        const organizadorId = req.user!.id;
        const salaId = req.params.id as string;
        const userIdAExpulsar = Number(req.params.userId);

        const resultado = await expulsarJugadorService(salaId, userIdAExpulsar, organizadorId);
        res.status(200).json({ success: true, data: resultado });
    } catch (error: any) {
        if (!error.status) console.error(error);
        res.status(error.status || 500).json({
            success: false,
            message: error.status ? error.message : "Error interno del servidor",
        });
    }
};

// PATCH /api/salas/:id
export const editar = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const salaId = req.params.id as string;
        const datos = req.body as EditarSalaBody;
        const salaActualizada = await editarSalaService(salaId, userId, datos);
        res.status(200).json({ success: true, data: salaActualizada });
    } catch (error: any) {
        if (!error.status) console.error(error);
        res.status(error.status || 500).json({
            success: false,
            message: error.status ? error.message : "Error interno del servidor",
        });
    }
}