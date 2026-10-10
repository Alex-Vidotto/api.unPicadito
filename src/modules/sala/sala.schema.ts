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
    estadoDisponibilidad: z.enum(["DISPONIBLES", "LLENAS", "TODAS"]).default("TODAS"),
    esPublica: booleanQuery.optional(),
    permiteSuplentes: booleanQuery.optional(),
    nombre: z.string().optional(),
    nombreCancha: z.string().optional(),
    limite: z.coerce.number().int().positive().max(100).default(20),
    pagina: z.coerce.number().int().positive().default(1),
});

export const crearSalaBodySchema = z.object({
    nombre: z.string().min(3).max(50),
    descripcion: z.string().optional(),
    nombreCancha: z.string().min(3).max(50),
    direccion: z.string().min(5).max(100),
    fechaHoraPartido: z.coerce.date().refine((fecha) => fecha > new Date(), {
        message: "La fecha del partido no puede ser en el pasado",
    }),
    cuposTotales: z.number().int().positive().default(10),
    permiteSuplentes: booleanQuery.optional(),
    cuposSuplentesMax: z.number().int().min(0).default(4),
    esPublica: booleanQuery.optional(),
    ubicacion: z.object({
        x: z.number().finite().min(-180).max(180),
        y: z.number().finite().min(-90).max(90),
    }),
});

export const editarSalaBodySchema = z.object({
    nombre: z.string().min(3).max(50).optional(),
    descripcion: z.string().optional(),
    nombreCancha: z.string().min(3).max(50).optional(),
    direccion: z.string().min(5).max(100).optional(),
    fechaHoraPartido: z.coerce.date()
        .refine((fecha) => fecha > new Date(), {
            message: "La nueva fecha del partido no puede ser en el pasado",
        })
        .optional(),
    cuposTotales: z.number().int().positive().optional(),
    permiteSuplentes: z.boolean().optional(),
    cuposSuplentesMax: z.number().int().min(0).optional(),
    esPublica: z.boolean().optional(),
    ubicacion: z.object({
        x: z.number().finite().min(-180).max(180),
        y: z.number().finite().min(-90).max(90),
    }).optional(),
}).refine((datos) => Object.keys(datos).length > 0, {
    message: "Debe modificarse al menos un campo para llevar a cabo esta acción.",
});

export const cambiarEstadoSalaBodySchema = z.object({
    motivoCancelacion: z
        .string({
            error: (issue) =>
                issue.input === undefined
                    ? { message: "El motivo de la cancelación es obligatorio" }
                    : { message: "El motivo debe ser un texto" },
        })
        .min(10, "Debe tener mínimo 10 caracteres")
        .max(500, "No debe superar los 500 caracteres"),
});

export const salaIdParamsSchema = z.object({
    id: z.string().uuid({ message: "El ID de la sala no tiene un formato UUID válido." }),
});

export const leaveSalaSchema = salaIdParamsSchema;

export const expulsarJugadorSchema = z.object({
    id: z.string().uuid("ID de sala inválido"),
    userId: z.string().regex(/^\d+$/, "El ID del usuario debe ser un número válido"),
});

export const transferirOrganizadorBodySchema = z.object({
    nuevoOrganizadorUserId: z
        .number({ error: () => ({ message: "El ID del nuevo organizador debe ser un número" }) })
        .int("Debe ser un número entero")
        .positive("Debe ser un ID de usuario válido"),
});

export const aceptarSolicitudParamsSchema = z.object({
    id: z.string().uuid("El ID de la sala no tiene un formato UUID válido"),
    participacionId: z.string().uuid("El ID de la participación no tiene un formato UUID válido"),
});

export type BooleanQuery = z.infer<typeof booleanQuery>;
export type BuscarSalasQuery = z.infer<typeof buscarSalasQuerySchema>;
export type CrearSalaBody = z.infer<typeof crearSalaBodySchema>;
export type EliminarSalaBody = z.infer<typeof cambiarEstadoSalaBodySchema>;
export type SalaIdParams = z.infer<typeof salaIdParamsSchema>;
export type LeaveSalaParams = z.infer<typeof leaveSalaSchema>;
export type ExpulsarJugador = z.infer<typeof expulsarJugadorSchema>;
export type EditarSalaBody = z.infer<typeof editarSalaBodySchema>;
export type TransferirOrganizadorBody = z.infer<typeof transferirOrganizadorBodySchema>;
export type AceptarSolicitudParams = z.infer<typeof aceptarSolicitudParamsSchema>;