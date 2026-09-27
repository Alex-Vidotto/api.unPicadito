import { Request, Response } from "express";
import { leaveMatchService } from "../modules/matches/matches.service";

export const leaveMatchController = async (req: Request, res: Response) => {
  try {
    const matchId = req.params.matchId;
    const userId = req.user?.id; // Extraído del token JWT por el middleware

    if (!userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const result = await leaveMatchService(matchId, userId);

    return res.status(200).json({
      message: "Partido abandonado exitosamente",
      data: result,
    });
  } catch (error: any) {
    return res
      .status(400)
      .json({ message: error.message || "Error al salir de la sala" });
  }
};
