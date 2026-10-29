import { Request, Response } from "express";
import { BuscarPrediosCercanosQuery } from "./predio.schema";
import { buscarPrediosService, obtenerCanchasPorPredioService } from "./predio.service";

const responderError = (res: Response, error: unknown) => {
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

export const buscarCercanos = async (req: Request, res: Response) => {
    try {
        const filtros = req.query as unknown as BuscarPrediosCercanosQuery;
        const predios = await buscarPrediosService(filtros);
        res.status(200).json({ success: true, data: predios });
    } catch (error) {
        responderError(res, error);
    }
};

export const obtenerCanchas = async (req: Request, res: Response) => {
    try {
        const predioId = Number(req.params.id);
        const canchas = await obtenerCanchasPorPredioService(predioId);
        res.status(200).json({ success: true, data: canchas });
    } catch (error) {
        responderError(res, error);
    }
};
