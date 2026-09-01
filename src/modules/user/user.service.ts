import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "./user.repository";
import { User } from "./user.entity";

export interface RegisterDTO {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    passwordConfim?: string;
    nickname?: string;
    profilePictureUrl?: string;
}

export interface LoginDTO {
    email?: string;
    username?: string;
    password?: string;
}

export interface AuthResponse {
    message: string;
    user: {
        id: number;
        firstName: string;
        lastName: string;
        username: string;
        email: string;
        nickname?: string;
        profilePictureUrl?: string;
        mainPosition: string;
        reputation: number;
    };
    token: string;
}



export class UserService {
    private userRepository: UserRepository;
    private readonly SALT_ROUNDS = 10;

    constructor() {
        this.userRepository = new UserRepository();
    }

    public async register(data: RegisterDTO): Promise<AuthResponse> {
        // 1. Los datos (data) ya vienen validados y sanitizados por Yup

        // 2. Solo comprobamos reglas de base de datos
        await this.ensureEmailAndUsernameAreUnique(data.email!, data.username!);

        // 3. Hasheamos
        const passwordHash = await bcrypt.hash(data.password!, this.SALT_ROUNDS);

        // 4. Guardamos
        const newUser = await this.userRepository.create({
            nombre: data.firstName!,
            apellido: data.lastName!,
            nombreUsuario: data.username!,
            email: data.email!,
            passwordHash,
            apodo: data.nickname,
            fotoPerfilUrl: data.profilePictureUrl,
        });

        // 5. Devolvemos respuesta
        return this.buildAuthResponse(newUser, "User registered successfully");
    }

    async login(data: LoginDTO): Promise<AuthResponse> {
        const { email, username, password } = data;

        // 1. Validar presencia de campos
        const identifier = email || username;
        if (!identifier || !password) {
            throw { status: 400, message: "Email or username and password are required" };
        }

        // 2. Buscar usuario por Email o por Username
        const trimmedIdentifier = identifier.trim();
        let user = await this.userRepository.findByEmailForLogin(trimmedIdentifier);

        if (!user) {
            user = await this.userRepository.findByUsernameForLogin(trimmedIdentifier);
        }

        // 3. Validar si el usuario existe
        if (!user) {
            throw { status: 401, message: "Invalid credentials" };
        }

        // 4. Verificar la contraseña con bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw { status: 401, message: "Invalid credentials" };
        }

        // 5. Generar Token JWT
        const jwtSecret = process.env.JWT_SECRET || "unPicadito_secret_key_2026";
        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.nombreUsuario },
            jwtSecret,
            { expiresIn: "7d" }
        );

        // 6. Retornar respuesta segura (sin hash)
        return {
            message: "Login successful",
            user: {
                id: user.id,
                firstName: user.nombre,
                lastName: user.apellido,
                username: user.nombreUsuario,
                email: user.email,
                nickname: user.apodo,
                profilePictureUrl: user.fotoPerfilUrl,
                mainPosition: user.posicionPrincipal,
                reputation: Number(user.reputacion),
            },
            token,
        };
    }

    // ─── Métodos privados ────────────────────────────────────────────────────────

    private async ensureEmailAndUsernameAreUnique(email: string, username: string): Promise<void> {
        const [existingEmail, existingUsername] = await Promise.all([
            this.userRepository.findByEmail(email),
            this.userRepository.findByUsername(username),
        ]);

        if (existingEmail) {
            throw { status: 409, message: "Email is already in use" };
        }
        if (existingUsername) {
            throw { status: 409, message: "Username is already taken" };
        }
    }

    private buildAuthResponse(user: User, message: string): AuthResponse {
        const jwtSecret = process.env.JWT_SECRET || "unPicadito_secret_key_2026";
        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.nombreUsuario },
            jwtSecret,
            { expiresIn: "7d" }
        );

        return {
            message,
            user: {
                id: user.id,
                firstName: user.nombre,
                lastName: user.apellido,
                username: user.nombreUsuario,
                email: user.email,
                nickname: user.apodo,
                profilePictureUrl: user.fotoPerfilUrl,
                mainPosition: user.posicionPrincipal,
                reputation: Number(user.reputacion),
            },
            token,
        };
    }
}