import { findPlayers } from './user.repository';
export const searchPlayers = async (searchTerm) => {
    const cleanTerm = searchTerm?.trim();
    if (cleanTerm && cleanTerm.length < 2) {
        throw new Error("El término de búsqueda debe tener al menos 2 caracteres.");
    }
    return await findPlayers({ term: cleanTerm });
};
