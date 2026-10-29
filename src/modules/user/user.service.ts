import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as userRepository from './user.repository';
import { findPlayers, findUserById, findPublicUserById } from './user.repository.js';
import type { PosicionCancha } from '../../constants/type';
import type { User } from './user.entity';

export interface RegisterDto {
    email: string;
    password: string;
    passwordConfirm: string;
    nombreUsuario: string;
    nombre: string;
    apellido: string;
    apodo?: string;
}

export interface UpdateProfileDto {
    email?: string;
    nombreUsuario?: string;
    nombre?: string;
    apellido?: string;
    apodo?: string;
    fotoPerfilUrl?: string | null;
    posicionPrincipal?: PosicionCancha;
    currentPassword?: string;
    password?: string;
    passwordConfirm?: string;
}

// Corregido: El Partial solo afecta a email y nombreUsuario. El password queda obligatorio.
export type LoginDto = Partial<Pick<RegisterDto, "email" | "nombreUsuario">> & Pick<RegisterDto, "password">;

// --- HELPER INTERNO (DRY) ---
const generateAuthResponse = (user: any) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("Falta configurar JWT_SECRET en las variables de entorno.");
    }
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
        ? await userRepository.findByEmailConPassword(email)
        : await userRepository.findByUsernameConPassword(nombreUsuario!);

    if (!user) throw new Error("Credenciales inválidas.");

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) throw new Error("Credenciales inválidas.");

    // Usamos el helper
    return generateAuthResponse(user);
};

export const searchPlayers = async (searchTerm?: string, pagina: number = 1, limite: number = 12) => {
    const cleanTerm = searchTerm?.trim();
    if (cleanTerm && cleanTerm.length < 2) throw new Error("El término de búsqueda debe tener al menos 2 caracteres.");

    return await userRepository.findPlayers({ term: cleanTerm, pagina, limite });
};

export const getUserProfile = async (userId: number) => {
  const user = await findUserById(userId);
  
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  
  return user;
};

export const getPublicUserProfile = async (userId: number) => {
  const user = await findPublicUserById(userId);
  
  if (!user) {
    throw new Error("Jugador no encontrado");
  }
  
  return user;
};

export const updateUserProfile = async (userId: number, dto: UpdateProfileDto) => {
    const user = await userRepository.findUserForUpdate(userId);
    if (!user) throw new Error("Usuario no encontrado.");

    const updateData: Partial<User> = {};
    if (dto.email !== undefined) {
        const email = dto.email.toLowerCase().trim();
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser && existingUser.id !== userId) {
            throw new Error("El email ya está registrado.");
        }
        updateData.email = email;
    }
    if (dto.nombreUsuario !== undefined) {
        const nombreUsuario = dto.nombreUsuario.trim();
        const existingUser = await userRepository.findByUsername(nombreUsuario);
        if (existingUser && existingUser.id !== userId) {
            throw new Error("El nombre de usuario ya está registrado.");
        }
        updateData.nombreUsuario = nombreUsuario;
    }
    if (dto.nombre !== undefined) updateData.nombre = dto.nombre.trim();
    if (dto.apellido !== undefined) updateData.apellido = dto.apellido.trim();
    if (dto.apodo !== undefined) updateData.apodo = dto.apodo.trim();
    if (dto.fotoPerfilUrl !== undefined) updateData.fotoPerfilUrl = dto.fotoPerfilUrl?.trim() || null;
    if (dto.posicionPrincipal !== undefined) updateData.posicionPrincipal = dto.posicionPrincipal;
    if (dto.password !== undefined) {
        if (!dto.currentPassword || !await bcrypt.compare(dto.currentPassword, user.passwordHash)) {
            throw new Error("La contraseña actual es incorrecta.");
        }
        if (dto.password !== dto.passwordConfirm) {
            throw new Error("Las nuevas contraseñas no coinciden.");
        }
        updateData.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    await userRepository.updateUser(userId, updateData);
    const updatedUser = await userRepository.findSafeUserById(userId);
    if (!updatedUser) throw new Error("No se pudo recuperar el perfil actualizado.");
    return updatedUser;
};
