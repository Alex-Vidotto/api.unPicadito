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