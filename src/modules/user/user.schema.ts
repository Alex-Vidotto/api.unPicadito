import { z } from "zod";
import { POSICION_CANCHA } from "../../constants/type";

const POSICIONES_VALIDAS = Object.values(POSICION_CANCHA) as [string, ...string[]];

export const registerSchema = z.object({
    nombre: z.string().trim().min(1, "First name is required"),
    apellido: z.string().trim().min(1, "Last name is required"),
    nombreUsuario: z.string().trim().min(1, "Username is required"),
    email: z.string().trim().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    passwordConfirm: z.string().min(1, "Password confirmation is required"),
    apodo: z.string().trim().optional(),
    fotoPerfilUrl: z.string().trim().url("Must be a valid URL").optional(),
}).refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
});

export const loginSchema = z.object({
    email: z.string().trim().email("Invalid email format").optional(),
    nombreUsuario: z.string().trim().optional(),
    password: z.string().min(1, "Password is required"),
}).refine((data) => !!(data.email || data.nombreUsuario), {
    message: "Email or username is required",
    path: ["email"],
});

export const userIdParamSchema = z.object({
    id: z.coerce.number().int().positive("El ID del jugador debe ser un número válido"),
});

export const searchUserQuerySchema = z.object({
    term: z.string().trim().optional(),
    q: z.string().trim().optional(),
    limite: z.coerce.number().int().positive().max(100).default(12),
    pagina: z.coerce.number().int().positive().default(1),
});

export const updateProfileSchema = z.object({
    email: z.string().trim().email("Ingresá un email válido").max(100).optional(),
    nombreUsuario: z.string().trim().min(1).max(50).optional(),
    nombre: z.string().trim().min(1).max(100).optional(),
    apellido: z.string().trim().min(1).max(100).optional(),
    apodo: z.string().trim().max(100).optional(),
    fotoPerfilUrl: z.string().trim().url("Ingresá una URL válida").max(255).nullable().optional(),
    posicionPrincipal: z.enum(POSICIONES_VALIDAS).optional(),
    currentPassword: z.string().optional(),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
    passwordConfirm: z.string().optional(),
}).superRefine((data, context) => {
    if (Object.keys(data).length === 0) {
        context.addIssue({
            code: "custom",
            message: "Tenés que enviar al menos un dato para actualizar.",
        });
    }

    const hasPasswordData = data.currentPassword !== undefined
        || data.password !== undefined
        || data.passwordConfirm !== undefined;
    if (hasPasswordData) {
        if (!data.currentPassword) {
            context.addIssue({
                code: "custom",
                path: ["currentPassword"],
                message: "Ingresá tu contraseña actual.",
            });
        }
        if (!data.password) {
            context.addIssue({
                code: "custom",
                path: ["password"],
                message: "Ingresá una nueva contraseña.",
            });
        }
        if (!data.passwordConfirm) {
            context.addIssue({
                code: "custom",
                path: ["passwordConfirm"],
                message: "Confirmá la nueva contraseña.",
            });
        } else if (data.password !== data.passwordConfirm) {
            context.addIssue({
                code: "custom",
                path: ["passwordConfirm"],
                message: "Las nuevas contraseñas no coinciden.",
            });
        }
    }
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
