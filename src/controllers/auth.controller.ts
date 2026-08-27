import { Request, Response } from 'express';

export const register = async (req: Request, res: Response): Promise<any> => {
    console.log("Datos recibidos en Registro:", req.body);
    
    // Devolvemos directamente el éxito simulado sin try/catch para asegurar la respuesta
    return res.status(201).json({
        message: "Usuario registrado con éxito",
        token: "jwt_token_falso_de_prueba_register",
        user: { email: req.body.email }
    });
};

export const login = async (req: Request, res: Response): Promise<any> => {
    console.log("Datos recibidos en Login:", req.body);
    
    return res.status(200).json({
        message: "Sesión iniciada con éxito",
        token: "jwt_token_falso_de_prueba_login",
        user: { email: req.body.email }
    });
};
// ... (manten tus funciones de register y login iguales arriba)

export const getPartidos = async (req: Request, res: Response): Promise<any> => {
    console.log("Petición de partidos actuales recibida");
    return res.status(200).json([
        {
            id: 1,
            titulo: "Partido de prueba en Los Andes",
            fecha: "Hoy",
            hora: "20:00",
            modalidad: "7 vs 7",
            superficie: "Sintético",
            lugar: "Complejo Los Andes",
            ciudad: "Córdoba, Argentina",
            jugadoresActuales: 8,
            jugadoresMaximos: 14,
            imagen: "https://unsplash.com"
        }
    ]);
};

export const getActividades = async (req: Request, res: Response): Promise<any> => {
    return res.status(200).json([]); // Devolvemos lista vacía por ahora para pruebas
};

export const getSugerencias = async (req: Request, res: Response): Promise<any> => {
    return res.status(200).json([]); // Devolvemos lista vacía por ahora para pruebas
};

export const getProfile = async (req: Request, res: Response): Promise<any> => {
    return res.status(200).json({
        nombre: "Juan Carlos Pérez Gómez",
        username: "@juanperez10",
        avatar: "https://unsplash.com",
        conexiones: 156,
        partidos: 84,
        victorias: 52,
        goles: 18,
        posicion: "Delantero",
    });
};

// ... mantén tus funciones anteriores de register, login, getProfile, etc.

export const updateProfile = async (req: Request, res: Response): Promise<any> => {
    try {
        const { nombre, posicion, avatar } = req.body;
        
        console.log("Datos recibidos para actualizar perfil:", req.body);

        // Validamos de forma sencilla que el cliente envíe información básica
        if (!nombre) {
            return res.status(400).json({ message: "El nombre es un campo obligatorio." });
        }

        /* 💡 En el futuro aquí harás la persistencia real en MySQL:
           const usuarioRepository = AppDataSource.getRepository(Usuario);
           await usuarioRepository.update({ id: req.user.id }, { nombre, posicion, avatar });
        */

        // Devolvemos un mensaje de éxito y los datos modificados simulados
        return res.status(200).json({
            message: "Perfil actualizado con éxito",
            user: {
                nombre,
                posicion: posicion || "Sin posición favorita",
                avatar: avatar || "https://placeholder.com"
            }
        });
    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        return res.status(500).json({ message: "Error interno del servidor al actualizar." });
    }
};


