import { Request, Response } from "express";
import * as userService from "./user.service";

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    // 1. El ID del usuario vendrá del token decodificado por tu middleware de auth
    // (Asegúrate de que tu middleware guarde el id en req.user)
    const userId = (req as any).user?.id; 

    if (!userId) {
      return res.status(401).json({ error: "No autorizado. Falta el token de usuario." });
    }

    // 2. Llamamos al servicio para buscar los datos reales en MySQL
    const userProfile = await userService.getUserProfileById(userId);

    // 3. Respondemos al frontend
    res.status(200).json(userProfile);
  } catch (error: any) {
    // Si el usuario no existe o la BD falla, capturamos el error
    res.status(400).json({ error: error.message });
  }
};
