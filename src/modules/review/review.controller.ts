import { Request, Response } from 'express';
import { ReviewService } from './review.service.js';

export const ReviewController = {
    crear: async (req: Request, res: Response): Promise<void> => {
        try {
            const resultado = await ReviewService.guardarResena(req.body);
            res.status(201).json({ ok: true, message: "Reseña guardada exitosamente.", data: resultado });
        } catch (error: any) {
            res.status(400).json({ ok: false, error: error.message });
        }
    },
    obtenerRanking: async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const resultado = await ReviewService.obtenerRankingJugador(Number(id));
            res.status(200).json({ ok: true, data: resultado });
        } catch (error: any) {
            res.status(500).json({ ok: false, error: error.message });
        }
    }
};
