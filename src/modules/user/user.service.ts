import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as userRepository from './user.repository';

export interface RegisterDto {
    email: string;
    password: string;
    passwordConfirm: string;
    nombreUsuario: string;
    nombre: string;
    apellido: string;
    apodo?: string;
}

// Corregido: El Partial solo afecta a email y nombreUsuario. El password queda obligatorio.
export type LoginDto = Partial<Pick<RegisterDto, "email" | "nombreUsuario">> & Pick<RegisterDto, "password">;

// --- HELPER INTERNO (DRY) ---
const generateAuthResponse = (user: any) => {
    const secret = process.env.JWT_SECRET || "secreto_desarrollo_temporal";
    const token = jwt.sign(
        { id: user.id, email: user.email, nombreUsuario: user.nombreUsuario },
        secret,
        { expiresIn: '24h' }
    );
    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, token };
};

export const registerUser = async (dto: RegisterDto) => {
    const { email, password, passwordConfirm, nombreUsuario, nombre, apellido, apodo } = dto;

    if (password !== passwordConfirm) throw new Error("Las contraseñas no coinciden.");

    if (await userRepository.findByEmail(email)) throw new Error("El email ya esta registrado.");
    if (await userRepository.findByUsername(nombreUsuario)) throw new Error("El nombre de usuario ya esta registrado.");

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await userRepository.createUser({
        email, passwordHash, nombreUsuario, nombre, apellido, apodo,
    });

    // Usamos el helper
    return generateAuthResponse(newUser);
};

export const loginUser = async (dto: LoginDto) => {
    const { email, nombreUsuario, password } = dto;

    if (!email && !nombreUsuario) throw new Error("Debes proveer un email o nombre de usuario.");

    const user = email
        ? await userRepository.findByEmail(email)
        : await userRepository.findByUsername(nombreUsuario!);

    if (!user) throw new Error("Credenciales inválidas.");

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) throw new Error("Credenciales inválidas.");

    // Usamos el helper
    return generateAuthResponse(user);
};

export const searchPlayers = async (searchTerm?: string) => {
    const cleanTerm = searchTerm?.trim();
    if (cleanTerm && cleanTerm.length < 2) throw new Error("El término de búsqueda debe tener al menos 2 caracteres.");

    return await userRepository.findPlayers({ term: cleanTerm });
};