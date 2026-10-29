import { Request, Response } from "express";
import * as friendshipService from "./friendship.service";

export const sendFriendshipRequest = async (req: Request, res: Response) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user?.id;

    if (!senderId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const request = await friendshipService.sendRequest(senderId, Number(receiverId));
    return res.status(201).json({ message: "Solicitud enviada exitosamente", data: request });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({ message: error.message || "Error en el servidor" });
  }
};

export const respondFriendship = async (req: Request, res: Response) => {
  try {
    const requestId = Number(req.params.id);
    const { status } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const updated = await friendshipService.respondRequest(requestId, userId, status);
    return res.status(200).json({ message: "Solicitud actualizada", data: updated });
  } catch (error: any) {
    const status = error.status || 500;
    return res.status(status).json({ message: error.message || "Error en el servidor" });
  }
};
