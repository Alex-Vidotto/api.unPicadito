import * as yup from "yup";

export const registerSchema = yup.object({
    nombre: yup.string().trim().required("First name is required"),
    apellido: yup.string().trim().required("Last name is required"),
    nombreUsuario: yup.string().trim().required("Username is required"),
    email: yup.string().email("Invalid email format").trim().required("Email is required"),
    password: yup.string().min(6, "Password must be at least 6 characters long").required("Password is required"),
    passwordConfirm: yup.string()
        .oneOf([yup.ref('password')], 'Passwords do not match')
        .required("Password confirmation is required"),
    apodo: yup.string().trim().optional(),
    fotoPerfilUrl: yup.string().url("Must be a valid URL").trim().optional(),
});

export const loginSchema = yup.object({
    email: yup.string().email("Invalid email format").trim().optional(),
    nombreUsuario: yup.string().trim().optional(),
    password: yup.string().required("Password is required"),
}).test(
    'at-least-one-identifier',
    'Email or username is required',
    (value) => !!(value.email || value.nombreUsuario)
);