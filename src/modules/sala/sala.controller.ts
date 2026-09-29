import { Request, Response } from "express";
import { buscarSalas, crearSalaService, cambiarEstadoSalaService } from "./sala.service";
import { buscarSalasQuerySchema, CrearSalaBody, EliminarSalaBody } from "./sala.schema";

export const getSalasController = async (req: Request, res: Response) => {
    const filtros = buscarSalasQuerySchema.parse(req.query);
    const userId = req.user?.id;

    // userId ahora está tipado como number
    const salas = await buscarSalas(filtros, userId as number);

    res.status(200).json({
        success: true,
        data: salas
    });
};

// NUEVO: Crear Sala
export const postSalaController = async (req: Request, res: Response) => {
    const data = req.body as CrearSalaBody;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "No autorizado" });
    }

    const nuevaSala = await crearSalaService(data, userId);

    res.status(201).json({
        success: true,
        data: nuevaSala
    });
};

export const cambiarEstadoSalaController = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        
        if (typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "El id de la sala no es válido",
            });
        }

        const userId = req.user?.id;
        const { motivoCancelacion } = req.body as EliminarSalaBody;

        if (!userId) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        const resultado = await cambiarEstadoSalaService(id, userId, motivoCancelacion);
        res.status(200).json({
            success: true,
            data: resultado
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}