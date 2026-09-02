import { AppDataSource } from "../../database/data-source";
import { User } from "./user.entity";

const getRepo = () => AppDataSource.getRepository(User);

export const findPlayers = async (filters?: { term?: string }) => {
    const query = getRepo().createQueryBuilder("user");

    if (filters?.term) {
        query.andWhere(
            "(user.nombre LIKE :term OR user.apellido LIKE :term OR user.nombreUsuario LIKE :term OR user.apodo LIKE :term)",
            { term: `%${filters.term}%` }
        );
    }

    query.orderBy("user.creadoEn", "DESC");
    return await query.getMany();
};
import { Repository } from "typeorm";
import { AppDataSource } from "../../database/data-source";
import { User } from "./user.entity";

export class UserRepository {
    private repository: Repository<User>;

    constructor() {
        this.repository = AppDataSource.getRepository(User);
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.repository.findOne({
            where: { email: email.toLowerCase().trim() },
        });
    }

    async findByUsername(username: string): Promise<User | null> {
        return await this.repository.findOne({
            where: { nombreUsuario: username.trim() },
        });
    }

    async findByEmailForLogin(email: string): Promise<User | null> {
        return await this.repository.findOne({
            where: { email: email.toLowerCase().trim() },
            select: { id: true, email: true, passwordHash: true, nombreUsuario: true, nombre: true, apellido: true, posicionPrincipal: true, reputacion: true }
        });
    }

    async findByUsernameForLogin(username: string): Promise<User | null> {
        return await this.repository.findOne({
            where: { nombreUsuario: username.trim() },
            select: { id: true, email: true, passwordHash: true, nombreUsuario: true, nombre: true, apellido: true, posicionPrincipal: true, reputacion: true }
        });
    }

    async create(userData: Partial<User>): Promise<User> {
        const newUser = this.repository.create({
            ...userData,
            email: userData.email?.toLowerCase().trim(),
            nombreUsuario: userData.nombreUsuario?.trim(),
        });
        return await this.repository.save(newUser);
    }
}