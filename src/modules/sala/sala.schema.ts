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

// Schema para crear una sala
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



export type booleanQuery = z.infer<typeof booleanQuery>;
export type BuscarSalasQuery = z.infer<typeof buscarSalasQuerySchema>;
export type CrearSalaBody = z.infer<typeof crearSalaBodySchema>;