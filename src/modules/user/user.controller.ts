import { Request, Response, NextFunction } from "express";
import * as userService from "./user.service"
import { catchAsync } from "../../middlewares/validate.middleware";

// Maneja el registro de usuarios
export const register = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.registerUser(req.body);
    res.status(201).json(result);
});

// Maneja el inicio de sesión de usuarios
export const login = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.loginUser(req.body);
    res.status(200).json(result);
});

//  Maneja la actualización del perfil de usuario
export const searchPlayers = catchAsync(async (req: Request, res: Response) => {
    const term = req.query.q as string | undefined;

    const players = await userService.searchPlayers(term);
    res.status(200).json(players);
});

// Maneja la actualización del perfil de usuario
export const getUserProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id; 

    const profile = await userService.getUserProfile(userId);
    res.status(200).json(profile);
});

// Maneja la actualización del perfil de usuario
export const getPublicProfile = catchAsync(async (req: Request, res: Response) => {
    const idParam = String(req.params.id);
    const userId = parseInt(idParam, 10);

    if (isNaN(userId)) {
        return res.status(400).json({ error: "El ID del jugador debe ser un número válido." });
    }

    const profile = await userService.getPublicUserProfile(userId);
    res.status(200).json(profile);
});

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id; // ID del usuario autenticado obtenido por el middleware

    // Pasamos el ID y los datos del body (nombre, apellido, apodo, etc.) al servicio
    const updatedProfile = await userService.updateUserProfile(userId, req.body);
    
    res.status(200).json({
        success: true,
        message: "Perfil actualizado correctamente",
        user: updatedProfile
    });
});