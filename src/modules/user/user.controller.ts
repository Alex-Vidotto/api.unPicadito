import { Request, Response } from "express";
import * as userService from "./user.service"

export const searchPlayers = async (req: Request, res: Response) => {
  try {
    const term = req.query.q as string | undefined;

    const players = await userService.searchPlayers(term);
    res.status(200).json(players);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};