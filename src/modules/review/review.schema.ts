import { z } from "zod";

export const crearReviewBodySchema = z.object({
    salaId: z.string().uuid("El ID de la sala no tiene un formato UUID válido"),
    calificadoId: z.number({ error: () => ({ message: "El ID del jugador calificado debe ser un número" }) })
        .int("Debe ser un número entero")
        .positive("Debe ser un ID de usuario válido"),
    estrellas: z
        .number({ error: () => ({ message: "La puntuación debe ser un número" }) })
        .int("La puntuación debe ser un número entero")
        .min(1, "La puntuación mínima es 1 estrella")
        .max(5, "La puntuación máxima es 5 estrellas"),
    comentario: z.string().trim().max(500, "El comentario no debe superar los 500 caracteres").optional(),
});

export const usuarioIdParamsSchema = z.object({
    id: z.coerce.number().int("Debe ser un número entero").positive("El ID del jugador debe ser un número válido"),
});

export type CrearReviewBody = z.infer<typeof crearReviewBodySchema>;
export type UsuarioIdParams = z.infer<typeof usuarioIdParamsSchema>;

