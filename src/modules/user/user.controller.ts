import { Request, Response, NextFunction } from "express";
import * as userService from "./user.service"
import { catchAsync } from "../../middlewares/validate.middleware";

export const register = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.registerUser(req.body);
    res.status(201).json(result);
});

export const login = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.loginUser(req.body);
    res.status(200).json(result);
});

export const searchPlayers = catchAsync(async (req: Request, res: Response) => {
    const term = req.query.q as string | undefined;

    const players = await userService.searchPlayers(term);
    res.status(200).json(players);
});

export const getUserProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id; 

    const profile = await userService.getUserProfile(userId);
    res.status(200).json(profile);
});

export const getPublicProfile = catchAsync(async (req: Request, res: Response) => {
    const idParam = String(req.params.id);
    const userId = parseInt(idParam, 10);

    if (isNaN(userId)) {
        return res.status(400).json({ error: "El ID del jugador debe ser un número válido." });
    }

    const profile = await userService.getPublicUserProfile(userId);
    res.status(200).json(profile);
});