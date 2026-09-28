import { z } from "zod";

export const leaveMatchSchema = z.object({
  matchId: z
    .string()
    .uuid({ message: "El ID de la sala no tiene un formato UUID válido." }),
});
