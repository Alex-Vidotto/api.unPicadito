import { z } from "zod";

export const buscarPrediosCercanosSchema = z.object({
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
    radioKm: z.coerce.number().positive().default(10),
    busqueda: z.string().trim().optional(),
});

export const predioIdParamsSchema = z.object({
    id: z.coerce.number().int().positive("El ID del predio debe ser un número válido"),
});

export type BuscarPrediosCercanosQuery = z.infer<typeof buscarPrediosCercanosSchema>;
