import { AppDataSource } from "../../database/data-source";
import { User } from "./user.entity";

const getRepo = () => AppDataSource.getRepository(User);

export const findByEmail = async (email: string) => {
    return await getRepo().findOne({
        where: { email: email.toLowerCase().trim() },
    });
};

export const findByUsername = async (username: string) => {
    return await getRepo().findOne({
        where: { nombreUsuario: username.trim() },
    });
};

export const findByEmailConPassword = async (email: string) => {
    return await getRepo().createQueryBuilder("user")
        .addSelect("user.passwordHash")
        .where("user.email = :email", { email: email.toLowerCase().trim() })
        .getOne();
};

export const findByUsernameConPassword = async (username: string) => {
    return await getRepo().createQueryBuilder("user")
        .addSelect("user.passwordHash")
        .where("user.nombreUsuario = :username", { username: username.trim() })
        .getOne();
};

export const createUser = async (userData: Partial<User>) => {
    const repo = getRepo();
    const newUser = repo.create({
        ...userData,
        email: userData.email?.toLowerCase().trim(),
        nombreUsuario: userData.nombreUsuario?.trim(),
    });
    return await repo.save(newUser);
};

export const findPlayers = async (filters?: { term?: string; limite?: number; pagina?: number }) => {
    const limite = filters?.limite ?? 12;
    const pagina = filters?.pagina ?? 1;

    const query = getRepo().createQueryBuilder("user");

    if (filters?.term) {
        query.andWhere(
            "(user.nombre LIKE :term OR user.apellido LIKE :term OR user.nombreUsuario LIKE :term OR user.apodo LIKE :term OR user.posicionPrincipal LIKE :term)",
            { term: `%${filters.term}%` }
        );
    }

    query.orderBy("user.creadoEn", "DESC")
        .skip((pagina - 1) * limite)
        .take(limite);

    const [data, total] = await query.getManyAndCount();

    return {
        data,
        paginacion: {
            total,
            pagina,
            limite,
            totalPaginas: Math.ceil(total / limite) || 1,
        },
    };
};

export const findUserById = async (id: number) => {
    return await getRepo().createQueryBuilder("user")
        .select([
            "user.id",
            "user.nombre",
            "user.apellido",
            "user.nombreUsuario",
            "user.apodo",
            "user.email",
            "user.fotoPerfilUrl",
            "user.posicionPrincipal",
            "user.reputacion",
            "user.creadoEn",
        ])
        .leftJoinAndSelect("user.resenasRecibidas", "resenas")
        .leftJoin("resenas.calificador", "calificador")
        .addSelect([
            "calificador.id",
            "calificador.nombre",
            "calificador.apellido",
            "calificador.nombreUsuario",
            "calificador.fotoPerfilUrl",
        ])
        .where("user.id = :id", { id })
        .getOne();
};

export const findPublicUserById = findUserById;

export const findUserForUpdate = async (id: number) => {
    return await getRepo().createQueryBuilder("user")
        .addSelect("user.passwordHash")
        .where("user.id = :id", { id })
        .getOne();
};

export const updateUser = async (id: number, updateData: Partial<User>) => {
    await getRepo().update(id, updateData);
};

export const findSafeUserById = async (id: number) => {
    return await getRepo().findOne({ where: { id } });
};
