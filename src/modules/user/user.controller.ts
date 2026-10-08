import { Request, Response } from "express";
import * as userService from "./user.service";

// Nota: las respuestas exitosas mantienen el mismo formato que antes para no romper el frontend.
// Los errores responden { success: false, message }, igual que el manejador global de index.ts.

// Maneja el registro de usuarios
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await userService.registerUser(req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Maneja el inicio de sesión de usuarios
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await userService.loginUser(req.body);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Maneja la búsqueda de jugadores
export const searchPlayers = async (req: Request, res: Response): Promise<void> => {
    try {
        const term = req.query.q as string | undefined;

        const players = await userService.searchPlayers(term);
        res.status(200).json(players);
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Maneja el perfil privado del usuario autenticado
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const profile = await userService.getUserProfile(userId);
        res.status(200).json(profile);
    } catch (error: any) {
        res.status(404).json({ success: false, message: error.message });
    }
};

// Maneja la visualización de un perfil público
export const getPublicProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const idParam = String(req.params.id);
        const userId = parseInt(idParam, 10);

        if (isNaN(userId)) {
            res.status(400).json({ error: "El ID del jugador debe ser un número válido." });
            return;
        }

        const profile = await userService.getPublicUserProfile(userId);

        if (profile && profile.resenasRecibidas) {
            profile.resenasRecibidas = profile.resenasRecibidas.map((resena: any) => {
                if (resena.calificador) {
                    delete resena.calificador.passwordHash;
                }
                return resena;
            });
        }

        res.status(200).json(profile);
    } catch (error: any) {
        res.status(404).json({ success: false, message: error.message });
    }
};

// Maneja la actualización del perfil de usuario
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id; // ID del usuario autenticado obtenido por el middleware

        // Pasamos el ID y los datos del body (nombre, apellido, apodo, etc.) al servicio
        const updatedProfile = await userService.updateUserProfile(userId, req.body);

        res.status(200).json({
            success: true,
            message: "Perfil actualizado correctamente",
            user: updatedProfile
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};