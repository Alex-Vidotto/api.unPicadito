import { z } from "zod";


const booleanQuery = z.preprocess((value) => {
    if (typeof value !== "string") return value;

    if (value === "true" || value === "1") return true;
    if (value === "false" || value === "0") return false;

    return value;
}, z.boolean());


export const buscarSalasQuerySchema = z.object({
    lat: z.coerce.number({ message: "Latitud debe ser un número" }).optional(),
    lng: z.coerce.number({ message: "Longitud debe ser un número" }).optional(),
    radioKm: z.coerce.number().positive().default(10),

    fechaInicio: z.coerce.date().optional(),
    fechaFin: z.coerce.date().optional(),

    estadoDisponibilidad: z.enum(['DISPONIBLES', 'LLENAS', 'TODAS']).default('TODAS'),

    esPublica: booleanQuery.optional(),
    permiteSuplentes: booleanQuery.optional(),

    nombre: z.string().optional(),
    nombreCancha: z.string().optional(),

    // TODO: Descomentar cuando el módulo de amigos esté listo
    // soloAmigos: z.coerce.boolean().default(false)
});

export const crearSalaBodySchema = z.object({
    nombre: z.string().min(3).max(50),
    descripcion: z.string().optional(),
    nombreCancha: z.string().min(3).max(50),
    direccion: z.string().min(5).max(100),
    fechaHoraPartido: z.coerce.date(),
    cuposTotales: z.number().int().positive().default(10),
    permiteSuplentes: booleanQuery.optional(),
    cuposSuplentesMax: z.number().int().min(0).default(4),
    esPublica: booleanQuery.optional(),
    ubicacion: z.object({
        x: z.number(), // longitud
        y: z.number()  // latitud
    })
});

export const editarSalaBodySchema = z.object({
    nombre: z.string().min(3).max(50).optional(),
    descripcion: z.string().optional(),
    nombreCancha: z.string().min(3).max(50).optional(),
    direccion: z.string().min(5).max(100).optional(),
    fechaHoraPartido: z.coerce.date()
        .refine((fecha) => fecha > new Date(), {
            message: "La nueva fecha del partido no puede ser en el pasado"
        })
        .optional(),
    cuposTotales: z.number().int().positive().optional(),
    permiteSuplentes: z.boolean().optional(),
    cuposSuplentesMax: z.number().int().min(0).optional(),
    esPublica: z.boolean().optional(),
    ubicacion: z.object({
        x: z.number().finite().min(-180).max(180),
        y: z.number().finite().min(-90).max(90)
    }).optional()
}).refine((datos) => Object.keys(datos).length > 0, {
    message: "Debe modificarse al menos un campo para llevar acabo esta accion.",
});

export const cambiarEstadoSalaBodySchema = z.object({
    motivoCancelacion: z
        .string({
            error: (issue) =>
                issue.input === undefined
                    ? { message: "El motivo de la cancelacion es obligatorio" }
                    : { message: "El motivo debe ser un texto" },
        })
        .min(10, "Debe tener minimo 10 caracteres")
        .max(500, "No debe de superar los 500 caracteres"),
});

export const salaIdParamsSchema = z.object({
    id: z.string().uuid({ message: "El ID de la sala no tiene un formato UUID válido." }),
});


export const expulsarJugadorSchema = z.object({
    id: z.string().uuid("ID de sala inválido"),
    userId: z.string().regex(/^\d+$/, "El ID del usuario debe ser un número válido")
});

export type booleanQuery = z.infer<typeof booleanQuery>;
export type BuscarSalasQuery = z.infer<typeof buscarSalasQuerySchema>;
export type CrearSalaBody = z.infer<typeof crearSalaBodySchema>;
export type EliminarSalaBody = z.infer<typeof cambiarEstadoSalaBodySchema>;
export type SalaIdParams = z.infer<typeof salaIdParamsSchema>;
export type ExpulsarJugador = z.infer<typeof expulsarJugadorSchema>;
export type EditarSalaBody = z.infer<typeof editarSalaBodySchema>;