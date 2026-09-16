import { Request, Response } from "express";
import { z } from "zod";
import { AmistadService } from "./amistad.service";

const friendshipService = new AmistadService();

const updateFriendshipSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED"], {
    errorMap: () => ({ message: "El estado debe ser 'ACCEPTED' o 'REJECTED'" }),
  }),
});

export const respondToFriendRequest = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;
    const requestId = Number(id);

    if (isNaN(requestId)) {
      return res
        .status(400)
        .json({ message: "El ID de la solicitud debe ser un número válido." });
    }

    const userId = (req as any).user?.id;

    const validation = updateFriendshipSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }

    const { status } = validation.data;

    const updatedRequest = await friendshipService.respondToRequest(
      requestId,
      userId,
      status,
    );

    return res.status(200).json({
      message: `Solicitud de amistad procesada con éxito.`,
      data: updatedRequest,
    });
  } catch (error: any) {
    if (error.message === "NOT_FOUND") {
      return res
        .status(404)
        .json({ message: "La solicitud de amistad no existe." });
    }
    if (error.message === "FORBIDDEN") {
      return res.status(403).json({
        message: "No tienes permisos para responder a esta solicitud.",
      });
    }
    if (error.message === "ALREADY_PROCESSED") {
      return res
        .status(400)
        .json({ message: "Esta solicitud ya ha sido procesada previamente." });
    }

    console.error(error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};
