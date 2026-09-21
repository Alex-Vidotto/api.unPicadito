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
      "user.creadoEn"
    ])
    .where("user.id = :id", { id })
    .getOne();
};


export const findPublicUserById = async (id: number) => {
  return await getRepo().createQueryBuilder("user")
    .select([
      "user.id",
      "user.nombre",
      "user.apellido",
      "user.nombreUsuario",
      "user.apodo",
      "user.fotoPerfilUrl",
      "user.posicionPrincipal",
      "user.reputacion",
      "user.creadoEn"
    ])
    .where("user.id = :id", { id })
    .getOne();
};

export const updateUser = async (userId: number, updateData: any) => {
    const userRepository.update(userId, updateData);

    const updatedUser = await userRepository.findOne({
        where: { id: userId },
        select: [
            'id',
            'email',
            'nombreUsuario',
            'nombre',
            'apellido',
            'apodo',
            'fotoPerfilUrl',
            'posicionPrincipal',
            'reputacion',
        ]
    });
    return updatedUser;
}