import { Request, Response } from "express";
import { buscarSalas, crearSalaService } from "./sala.service";
import { BuscarSalasQuery, CrearSalaBody } from "./sala.schema";

export const getSalasController = async (req: Request, res: Response) => {
    const filtros = req.query as unknown as BuscarSalasQuery;
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