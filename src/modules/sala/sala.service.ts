import { buscarSalasConFiltros, crearNuevaSala, obtenerSalaConCreador, cambiarEstadoSalaEnBD } from "./sala.repository";
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

    return salas ?? [];
};

// Crear sala
export const crearSalaService = async (data: CrearSalaBody, userId: number) => {
    const nuevaSala = await crearNuevaSala(data, userId);
    return nuevaSala;
};

export const cambiarEstadoSalaService = async ( salaId: string, userId: number, motivo: string ) => {
    const sala = await obtenerSalaConCreador(salaId);

    if (!sala) throw new Error("Sala no encontrada");

    if (sala.creador.id !== userId) {
        throw new Error("Solo el creador de la sala puede dar de baja");
    };

    if (sala.estado === "CANCELADA" || sala.estado === "FINALIZADA") {
        throw new Error(`La sala se encuentra ${sala.estado}`);
    }

    await cambiarEstadoSalaEnBD(salaId, motivo);

    return { mensaje: 'Sala cancelada correctamente' };
};
