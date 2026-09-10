import { AppDataSource } from "../../databse/data-source.ts"; // Ajusta la ruta a tu archivo AppDataSource
import { User } from "../modules/user/user.entity.js";

export const getUserProfile = async (req, res) => {
  try {
    // 1. Obtenemos el ID del usuario autenticado que viene en el token
    const userId = req.user.id; 

    // 2. Obtenemos el repositorio de la entidad User
    const userRepository = AppDataSource.getRepository(User);

    // 3. Buscamos al usuario por su ID
    const user = await userRepository.findOne({
      where: { id: userId },
      // Opcional: Seleccionamos solo las columnas que queremos enviar al Front (NUNCA la contraseña)
      select: ["id", "name", "email", "role"] 
    });

    // 4. Si no existe, devolvemos un error 404
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // 5. Enviamos el perfil del usuario al frontend
    return res.status(200).json(user);

  } catch (error) {
    console.error("Error al obtener el perfil con TypeORM:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
