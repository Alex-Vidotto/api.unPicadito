import { Request, Response } from "express";
import { z } from "zod";
import { friendshipService } from "./friendship.service";

// UP-045: Controller para ENVIAR
const sendSchema = z.object({
  receiverId: z.number().positive(),
});

export const sendFriendshipRequest = async (req: Request, res: Response) => {
  try {
    const { receiverId } = sendSchema.parse(req.body);
    const senderId = req.user?.id;

    if (!senderId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const request = await friendshipService.sendRequest(senderId, receiverId);
    return res
      .status(201)
      .json({ message: "Solicitud enviada exitosamente", data: request });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Datos inválidos", errors: error.issues });
    }
    if (error.message === "BAD_REQUEST") {
      return res
        .status(400)
        .json({ message: "No puedes enviarte una solicitud a ti mismo" });
    }
    if (error.message === "CONFLICT") {
      return res
        .status(409)
        .json({
          message: "Ya existe una solicitud activa entre ambos usuarios",
        });
    }
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

// UP-046: Controller para RESPONDER (se mantiene)
const respondSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED"]),
});

export const respondFriendship = async (req: Request, res: Response) => {
  try {
    const requestId = Number(req.params.id);
    const { status } = respondSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const updated = await friendshipService.respondRequest(
      requestId,
      userId,
      status,
    );
    return res.json({ message: "Solicitud actualizada", data: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Datos inválidos", errors: error.issues });
    }
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ message: "La solicitud no existe" });
    }
    if (error.message === "FORBIDDEN") {
      return res
        .status(403)
        .json({ message: "No eres el destinatario de esta solicitud" });
    }
    if (error.message === "CONFLICT") {
      return res
        .status(409)
        .json({ message: "La solicitud ya fue respondida" });
    }
    return res.status(500).json({ message: "Error en el servidor" });
  }
};
