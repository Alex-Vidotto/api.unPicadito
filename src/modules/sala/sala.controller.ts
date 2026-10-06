import { Request, Response } from "express";
import {
    BuscarSalasQuery,
    CrearSalaBody,
    EliminarSalaBody,
    EditarSalaBody,
    TransferirOrganizadorBody,
} from "./sala.schema";
import {
    buscarSalas,
    crearSalaService,
    cambiarEstadoSalaService,
    unirseSalaService,
    leaveSalaService,
    expulsarJugadorService,
    editarSalaService,
    obtenerDetalleSalaService,
    transferirOrganizadorService,
} from "./sala.service";

const responderError = (res: Response, error: unknown): void => {
    if (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof error.status === "number" &&
        "message" in error &&
        typeof error.message === "string"
    ) {
        res.status(error.status).json({ success: false, message: error.message });
        return;
    }

    console.error(error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
};

export const buscar = async (req: Request, res: Response): Promise<void> => {
    try {
        const filtros = req.query as unknown as BuscarSalasQuery;
        const salas = await buscarSalas(filtros, req.user!.id);
        res.status(200).json({ success: true, data: salas });
    } catch (error) {
        responderError(res, error);
    }
};

export const obtenerPorId = async (req: Request, res: Response): Promise<void> => {
    try {
        const sala = await obtenerDetalleSalaService(req.params.id as string);
        res.status(200).json({ success: true, data: sala });
    } catch (error) {
        responderError(res, error);
    }
};

export const crear = async (req: Request, res: Response): Promise<void> => {
    try {
        const sala = await crearSalaService(req.body as CrearSalaBody, req.user!.id);
        res.status(201).json({ success: true, data: sala });
    } catch (error) {
        responderError(res, error);
    }
};

export const unirse = async (req: Request, res: Response): Promise<void> => {
    try {
        const resultado = await unirseSalaService(req.params.id as string, req.user!.id);
        res.status(200).json({ success: true, data: resultado });
    } catch (error) {
        responderError(res, error);
    }
};

export const salir = async (req: Request, res: Response): Promise<void> => {
    try {
        const resultado = await leaveSalaService(req.params.id as string, req.user!.id);
        res.status(200).json({ success: true, data: resultado });
    } catch (error) {
        responderError(res, error);
    }
};

export const cancelar = async (req: Request, res: Response): Promise<void> => {
    try {
        const { motivoCancelacion } = req.body as EliminarSalaBody;
        const resultado = await cambiarEstadoSalaService(
            req.params.id as string,
            req.user!.id,
            motivoCancelacion,
        );
        res.status(200).json({ success: true, data: resultado });
    } catch (error) {
        responderError(res, error);
    }
};

export const expulsarJugador = async (req: Request, res: Response): Promise<void> => {
    try {
        const resultado = await expulsarJugadorService(
            req.params.id as string,
            Number(req.params.userId),
            req.user!.id,
        );
        res.status(200).json({ success: true, data: resultado });
    } catch (error) {
        responderError(res, error);
    }
};

export const editar = async (req: Request, res: Response): Promise<void> => {
    try {
        const salaActualizada = await editarSalaService(
            req.params.id as string,
            req.user!.id,
            req.body as EditarSalaBody,
        );
        res.status(200).json({ success: true, data: salaActualizada });
    } catch (error) {
        responderError(res, error);
    }
};

export const transferirOrganizador = async (req: Request, res: Response): Promise<void> => {
    try {
        const { nuevoOrganizadorUserId } = req.body as TransferirOrganizadorBody;
        const resultado = await transferirOrganizadorService(
            req.params.id as string,
            req.user!.id,
            nuevoOrganizadorUserId,
        );
        res.status(200).json({ success: true, data: resultado });
    } catch (error) {
        responderError(res, error);
    }
};
