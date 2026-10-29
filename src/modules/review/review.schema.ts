import { z } from "zod";

export const crearReviewBodySchema = z.object({
    calificadoId: z.number({ message: "El ID del jugador calificado debe ser un número" })
        .int("Debe ser un número entero")
        .positive("Debe ser un ID de usuario válido"),
    salaId: z.string().uuid("El ID de la sala no tiene un formato UUID válido"),
    estrellas: z.number({ message: "La calificación debe ser un número" })
        .int("La calificación debe ser un número entero")
        .min(1, "La calificación mínima es 1 estrella")
        .max(5, "La calificación máxima es 5 estrellas"),
    comentario: z.string().trim().max(500, "El comentario no debe superar los 500 caracteres").optional(),
});

export const usuarioIdParamsSchema = z.object({
    id: z.coerce.number().int("Debe ser un número entero").positive("El ID del jugador debe ser un número válido"),
});

export type CrearReviewBody = z.infer<typeof crearReviewBodySchema>;
export type UsuarioIdParams = z.infer<typeof usuarioIdParamsSchema>;