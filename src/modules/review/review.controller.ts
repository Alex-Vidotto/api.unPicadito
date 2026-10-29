import { Request, Response } from "express";
import { CrearReviewBody } from "./review.schema";
import { crearReviewService, obtenerRankingService } from "./review.service";

const responderError = (res: Response, error: any): void => {
    if (typeof error.status === "number") {
        res.status(error.status).json({ success: false, message: error.message });
        return;
    }

    console.error(error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
};

export const crear = async (req: Request, res: Response): Promise<void> => {
    try {
        const calificadorId = req.user!.id;
        const resultado = await crearReviewService(req.body as CrearReviewBody, calificadorId);
        res.status(201).json({ success: true, data: resultado });
    } catch (error) {
        responderError(res, error);
    }
};

export const obtenerRanking = async (req: Request, res: Response): Promise<void> => {
    try {
        const resultado = await obtenerRankingService(Number(req.params.id));
        res.status(200).json({ success: true, data: resultado });
    } catch (error) {
        responderError(res, error);
    }
};