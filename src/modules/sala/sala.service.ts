import {
    buscarSalasConFiltros,
    crearNuevaSala,
    obtenerSalaConCreador,
    cambiarEstadoSalaEnBD,
    obtenerSalaConParticipantes,
    crearParticipacionEnSala,
    actualizarEstadoSalaEnBD,
    eliminarParticipacionDeSala,
    contarParticipantesConfirmados,
} from "./sala.repository";
import { BuscarSalasQuery, CrearSalaBody } from "./sala.schema";
import { ConflictError, ForbiddenError, NotFoundError } from "../../common/http-errors";

const ESTADOS_CERRADOS = ["CANCELADA", "FINALIZADA"];

// TODO: Cuando el módulo de amigos esté listo, obtener acá los ids de amigos del usuario
// y pasarlos a buscarSalasConFiltros (userId se usará entonces).
export const buscarSalas = (filtros: BuscarSalasQuery, userId: number) => {
    const amigosIds: number[] = [];
    return buscarSalasConFiltros(filtros, amigosIds);
};

export const crearSalaService = async (data: CrearSalaBody, userId: number) => {
    const sala = await crearNuevaSala(data, userId);

    await crearParticipacionEnSala(sala.id, userId, {
        estado: "CONFIRMADO",
        rol: "ORGANIZADOR",
        origenIngreso: "SOLICITUD_DIRECTA",
    });

    return sala;
};

export const cambiarEstadoSalaService = async (salaId: string, userId: number, motivo: string) => {
    const sala = await obtenerSalaConCreador(salaId);

    if (!sala) throw new NotFoundError("Sala no encontrada");
    if (sala.creador.id !== userId) throw new ForbiddenError("Solo el creador de la sala puede dar de baja");
    if (ESTADOS_CERRADOS.includes(sala.estado)) throw new ConflictError(`La sala se encuentra ${sala.estado}`);

    await cambiarEstadoSalaEnBD(salaId, motivo);
    return { mensaje: "Sala cancelada correctamente" };
};

export const leaveSalaService = async (salaId: string, userId: number) => {
    const sala = await obtenerSalaConParticipantes(salaId);

    if (!sala) throw new NotFoundError("Sala no encontrada");
    if (ESTADOS_CERRADOS.includes(sala.estado)) throw new ConflictError(`La sala se encuentra ${sala.estado}`);
    if (sala.creador?.id === userId) {
        throw new ConflictError("El creador de la sala no puede salir de ella. Debe cancelarla.");
    }

    const participacion = sala.participantes?.find((p) => p.usuario?.id === userId);
    if (!participacion) throw new NotFoundError("No estás participando en esta sala");

    await eliminarParticipacionDeSala(participacion.id);

    // Si la sala estaba completa y se liberó un cupo, se reabre
    if (sala.estado === "COMPLETA") {
        const confirmados = await contarParticipantesConfirmados(salaId);
        if (confirmados < sala.cuposTotales) {
            await actualizarEstadoSalaEnBD(salaId, "ABIERTA");
        }
    }

    return { salaId, userId, message: "Has salido de la sala correctamente" };
};

export const unirseSalaService = async (salaId: string, userId: number) => {
    const sala = await obtenerSalaConParticipantes(salaId);

    if (!sala) throw new NotFoundError("Sala no encontrada");
    // COMPLETA sigue aceptando gente si permite suplentes
    if (!["ABIERTA", "COMPLETA"].includes(sala.estado)) throw new ConflictError(`La sala se encuentra ${sala.estado}`);
    if (sala.participantes?.some((p) => p.usuario?.id === userId)) throw new ConflictError("Ya formas parte de esta sala");

    const confirmados = sala.participantes?.filter((p) => p.estado === "CONFIRMADO").length ?? 0;
    const hayCupo = confirmados < sala.cuposTotales;

    if (!hayCupo && !sala.permiteSuplentes) throw new ConflictError("La sala está completa");

    if (!sala.esPublica) {
        const participacion = await crearParticipacionEnSala(salaId, userId, {
            estado: "PENDIENTE",
            rol: "SOLICITANTE",
            origenIngreso: "SOLICITUD_DIRECTA",
        });

        return {
            mensaje: "Tu solicitud fue enviada y está pendiente de aprobación",
            requiereAprobacion: true,
            participacion,
        };
    }

    const rol = hayCupo ? "TITULAR" : "SUPLENTE";

    const participacion = await crearParticipacionEnSala(salaId, userId, {
        estado: "CONFIRMADO",
        rol,
        origenIngreso: "SOLICITUD_DIRECTA",
    });

    // Solo un titular puede completar la sala (un suplente entra con la sala ya completa)
    if (rol === "TITULAR" && confirmados + 1 >= sala.cuposTotales) {
        await actualizarEstadoSalaEnBD(salaId, "COMPLETA");
    }

    return { mensaje: "Te uniste a la sala correctamente", rol, participacion };
};

export const expulsarJugadorService = async (salaId: string, userIdAExpulsar: number, organizadorId: number) => {
    const sala = await obtenerSalaConParticipantes(salaId);

    if (!sala) throw new NotFoundError("Sala no encontrada");
    if (ESTADOS_CERRADOS.includes(sala.estado)) throw new ConflictError(`La sala se encuentra ${sala.estado}`);

    if (sala.creador?.id !== organizadorId) {
        throw new ForbiddenError("Solo el organizador de la sala puede expulsar jugadores");
    }

    if (userIdAExpulsar === organizadorId) {
        throw new ConflictError("No puedes expulsarte a ti mismo de esta forma. Debes cancelar la sala.");
    }

    const participacion = sala.participantes?.find((p) => p.usuario?.id === userIdAExpulsar);
    if (!participacion) throw new NotFoundError("El jugador no está participando en esta sala");

    await eliminarParticipacionDeSala(participacion.id);

    if (sala.estado === "COMPLETA") {
        const confirmados = await contarParticipantesConfirmados(salaId);
        if (confirmados < sala.cuposTotales) {
            await actualizarEstadoSalaEnBD(salaId, "ABIERTA");
        }
    }

    return { 
        salaId, 
        userIdExpulsado: userIdAExpulsar, 
        mensaje: "Jugador expulsado correctamente" 
    };
};