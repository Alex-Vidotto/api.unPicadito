import { AppDataSource } from "../../database/data-source";
import { Usuario } from "./usuario.entity";

export const repo = () => AppDataSource.getRepository(Usuario);

export const createUsuario = async (data: Partial<Usuario>) => {
  return repo().save(repo().create(data));
};


export const buscarJugadores = async (filtros?: { nombre?: string }) => {
  
  const query = repo().createQueryBuilder("user");

  
  if (filtros?.nombre) {
    query.andWhere("user.nombre LIKE :nombre", { nombre: `%${filtros.nombre}%` });
  }

  // Futuro por si agregamos filtro por zona
  // if (filtros?.zona) {
  //   query.andWhere("user.zona = :zona", { zona: filtros.zona });
  // }

  
  query.orderBy("user.creadoEn", "DESC");
  
  return await query.getMany(); 
};