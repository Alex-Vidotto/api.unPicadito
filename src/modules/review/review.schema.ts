import { z } from "zod";

export const crearReviewSchema = z.object({
    calificadoId: z.coerce.number().int().positive("El ID del jugador calificado es obligatorio"),
    salaId: z.string().uuid("El ID de la sala debe ser un UUID válido").optional(),
    estrellas: z.coerce.number().int().min(1, "La calificación mínima es 1 estrella").max(5, "La calificación máxima es 5 estrellas"),
    comentario: z.string().trim().max(500, "El comentario no debe superar los 500 caracteres").optional(),
});

export const rankingParamsSchema = z.object({
    id: z.coerce.number().int().positive("El ID del jugador debe ser un número válido"),
});

export type CrearReviewBody = z.infer<typeof crearReviewSchema>;
export type RankingParams = z.infer<typeof rankingParamsSchema>;
