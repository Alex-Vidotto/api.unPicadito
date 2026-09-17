import { AppDataSource } from "../../../database/data-source"; //la ruta del data-source
import { User } from "./user.entity"; //la ruta donde está tu entidad de Usuario

// ... (aquí debe estar tu función existente searchPlayers)

export const getUserProfileById = async (id: number) => {
  const userRepository = AppDataSource.getRepository(User);

  // Buscamos al usuario por su ID primario
  const user = await userRepository.findOne({
    where: { id: id },
    // Traemos solo los datos seguros, omitiendo la contraseña (password)
    select: ["id", "name", "email", "role"] 
  });

  // Si no se encuentra el registro, lanzamos un error que atrapará el controlador
  if (!user) {
    throw new Error("El usuario solicitado no existe.");
  }

  return user;
};
