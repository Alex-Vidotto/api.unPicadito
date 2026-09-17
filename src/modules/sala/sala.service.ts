import { buscarSalasConFiltros, crearNuevaSala } from "./sala.repository";
import { BuscarSalasQuery, CrearSalaBody } from "./sala.schema";

// TODO: Descomentar cuando el módulo de amigos esté listo
// import { friendshipService } from "../friendship/friendship.service";

export const buscarSalas = async (filtros: BuscarSalasQuery, userId: number) => {
    let amigosIds: number[] = [];

    // TODO: Descomentar cuando el módulo de amigos esté listo
    /*
    if (filtros.soloAmigos && userId) {
        amigosIds = await friendshipService.obtenerIdsDeAmigos(userId);
    }
    */

    const salas = await buscarSalasConFiltros(filtros, amigosIds);

    if (!salas || salas.length === 0) {
        const error = new Error("No se encontraron salas que coincidan con los filtros aplicados.");
        (error as any).status = 404; 
        throw error;
    }

    return salas;
};

// Crear sala
export const crearSalaService = async (data: CrearSalaBody, userId: number) => {
    const nuevaSala = await crearNuevaSala(data, userId);
    return nuevaSala;
};