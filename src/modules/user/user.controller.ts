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