import { Request, Response } from "express";
import { z } from "zod";
import { friendshipService } from "./friendship.service";

// Esquema de validación simple
const bodySchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED"]),
});

export const respondFriendship = async (req: Request, res: Response) => {
  try {
    const requestId = Number(req.params.id);
    const { status } = bodySchema.parse(req.body);
    const userId = req.user?.id; // || 1; ID del usuario autenticado por JWT

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

/*http://localhost:8080/api/friendships/5/respond --> POSTMAN 

Body

raw

JSON

{
  "status": "ACCEPTED"
}

*/
