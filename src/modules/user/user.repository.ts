import { Repository } from "typeorm";
import { AppDataSource } from "../../database/data-source";
import { User } from "./user.entity";

const getRepo = () => AppDataSource.getRepository(User);


export const findByEmail = async (email: string): Promise<User | null> => {
    return await getRepo().findOne({
        where: { email: email.toLowerCase().trim() },
    });
};

export const findByUsername = async (username: string): Promise<User | null> => {
    return await getRepo().findOne({
        where: { nombreUsuario: username.trim() },
    });
};

export const createUser = async (userData: Partial<User>): Promise<User> => {
    const repo = getRepo();
    const newUser = repo.create({
        ...userData,
        email: userData.email?.toLowerCase().trim(),
        nombreUsuario: userData.nombreUsuario?.trim(),
    });
    return await repo.save(newUser);
};

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

