import { Request, Response } from "express";
import * as userService from "./user.service";

export const register = async (req: Request, res: Response) => {
    try {
        const result = await userService.registerUser(req.body);
        return res.status(201).json(result);
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const result = await userService.loginUser(req.body);
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const searchPlayers = async (req: Request, res: Response) => {
    try {
        const term = (req.query.term || req.query.q) as string | undefined;
        const pagina = Number(req.query.pagina) || 1;
        const limite = Number(req.query.limite) || 12;
        const resultado = await userService.searchPlayers(term, pagina, limite);
        return res.status(200).json({
            success: true,
            data: resultado.data,
            paginacion: resultado.paginacion,
        });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const profile = await userService.getUserProfile(userId);
        return res.status(200).json(profile);
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message });
    }
};

export const getPublicProfile = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.params.id);
        const profile = await userService.getPublicUserProfile(userId);

        if (profile && profile.resenasRecibidas) {
            profile.resenasRecibidas = profile.resenasRecibidas.map((resena: any) => {
                if (resena.calificador) {
                    delete resena.calificador.passwordHash;
                }
                return resena;
            });
        }

        return res.status(200).json(profile);
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const updatedProfile = await userService.updateUserProfile(userId, req.body);

        return res.status(200).json({
            success: true,
            message: "Perfil actualizado correctamente",
            user: updatedProfile
        });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
};
