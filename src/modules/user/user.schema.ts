import * as yup from "yup";

export const registerSchema = yup.object({
    firstName: yup.string().trim().required("First name is required"),
    lastName: yup.string().trim().required("Last name is required"),
    username: yup.string().trim().required("Username is required"),
    email: yup.string().email("Invalid email format").trim().required("Email is required"),
    password: yup.string().min(6, "Password must be at least 6 characters long").required("Password is required"),
    passwordConfirm: yup.string()
        .oneOf([yup.ref('password')], 'Passwords do not match')
        .required("Password confirmation is required"),
    nickname: yup.string().trim().optional(),
    profilePictureUrl: yup.string().url("Must be a valid URL").trim().optional(),
});

export const loginSchema = yup.object({
    email: yup.string().email("Invalid email format").trim().optional(),
    username: yup.string().trim().optional(),
    password: yup.string().required("Password is required"),
}).test(
    'at-least-one-identifier',
    'Email or username is required',
    (value) => !!(value.email || value.username)
);