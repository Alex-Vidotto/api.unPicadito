import { Request, Response } from 'express';
import * as reviewService from './review.service';

export const crear = async (req: Request, res: Response) => {
    try {
        const calificadorId = req.user?.id;
        if (!calificadorId) {
            return res.status(401).json({ ok: false, message: "Usuario no autenticado." });
        }
        const resultado = await reviewService.guardarResena(req.body, calificadorId);
        return res.status(201).json({
            ok: true,
            message: "Reseña guardada exitosamente.",
            data: resultado
        });
    } catch (error: any) {
        return res.status(400).json({ ok: false, error: error.message });
    }
};

export const obtenerRanking = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const resultado = await reviewService.obtenerRankingJugador(Number(id));
        return res.status(200).json({ ok: true, data: resultado });
    } catch (error: any) {
        return res.status(500).json({ ok: false, error: error.message });
    }
};

export const ReviewController = {
    crear,
    obtenerRanking
};
