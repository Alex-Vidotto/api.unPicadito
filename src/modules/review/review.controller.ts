import { Request, Response } from "express";
import { CrearReviewBody } from "./review.schema";
import {
    crearReviewService,
    obtenerPendientesCalificarService,
    obtenerRankingService,
} from "./review.service";

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

export const crear = async (req: Request, res: Response): Promise<void> => {
    try {
        const calificadorId = req.user!.id;
        const resultado = await crearReviewService(
            req.body as CrearReviewBody,
            calificadorId,
        );
        res.status(201).json({ success: true, data: resultado });
    } catch (error) {
        responderError(res, error);
    }
};

export const pendientesCalificar = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const resultado = await obtenerPendientesCalificarService(
            req.params.id as string,
            req.user!.id,
        );
        res.status(200).json({ success: true, data: resultado });
    } catch (error) {
        responderError(res, error);
    }
};

export const obtenerRanking = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const resultado = await obtenerRankingService(Number(req.params.id));
        res.status(200).json({ success: true, data: resultado });
    } catch (error) {
        responderError(res, error);
    }
};
