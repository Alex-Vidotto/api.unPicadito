import { z } from "zod";

export const buscarSalasQuerySchema = z.object({
    lat: z.coerce.number({ message: "Latitud debe ser un número" }).optional(),
    lng: z.coerce.number({ message: "Longitud debe ser un número" }).optional(),
    radioKm: z.coerce.number().positive().default(10),
    
    fechaInicio: z.coerce.date().optional(),
    fechaFin: z.coerce.date().optional(),
    
    estadoDisponibilidad: z.enum(['DISPONIBLES', 'LLENAS', 'TODAS']).default('TODAS'),
    
    esPublica: z.coerce.boolean().optional(),
    permiteSuplentes: z.coerce.boolean().optional(),
    
    // TODO: Descomentar cuando el módulo de amigos esté listo
    // soloAmigos: z.coerce.boolean().default(false)
});

// Schema para crear una sala
export const crearSalaBodySchema = z.object({
    nombre: z.string().min(3).max(50),
    descripcion: z.string().optional(),
    nombreCancha: z.string().min(3).max(50),
    direccion: z.string().min(5).max(100),
    fechaHoraPartido: z.coerce.date(),
    cuposTotales: z.number().int().positive().default(10),
    permiteSuplentes: z.boolean().default(true),
    cuposSuplentesMax: z.number().int().min(0).default(4),
    esPublica: z.boolean().default(true),
    ubicacion: z.object({
        x: z.number(), // longitud
        y: z.number()  // latitud
    })
});

export type BuscarSalasQuery = z.infer<typeof buscarSalasQuerySchema>;
export type CrearSalaBody = z.infer<typeof crearSalaBodySchema>;