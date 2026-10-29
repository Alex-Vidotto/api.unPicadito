import { z } from "zod";
import { FRIENDSHIP_STATUS } from "../../constants/type";

export const sendFriendshipSchema = z.object({
  receiverId: z.coerce.number().int().positive("El ID del usuario destinatario debe ser un número positivo"),
});

export const respondFriendshipBodySchema = z.object({
  status: z.enum([FRIENDSHIP_STATUS.ACCEPTED, FRIENDSHIP_STATUS.REJECTED], {
    message: `El estado debe ser '${FRIENDSHIP_STATUS.ACCEPTED}' o '${FRIENDSHIP_STATUS.REJECTED}'`,
  }),
});

export const friendshipIdParamSchema = z.object({
  id: z.coerce.number().int().positive("El ID de la solicitud debe ser un número válido"),
});

export type SendFriendshipBody = z.infer<typeof sendFriendshipSchema>;
export type RespondFriendshipBody = z.infer<typeof respondFriendshipBodySchema>;
