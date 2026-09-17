import { z } from "zod";

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
    path: ["passwordConfirm"], // El error aparecerá específicamente en este campo
});

export const loginSchema = z.object({
    email: z.string().trim().email("Invalid email format").optional(),
    nombreUsuario: z.string().trim().optional(),
    password: z.string().min(1, "Password is required"),
}).refine((data) => !!(data.email || data.nombreUsuario), {
    message: "Email or username is required",
    path: ["email"], // Si falta, el error lo marcará acá
});