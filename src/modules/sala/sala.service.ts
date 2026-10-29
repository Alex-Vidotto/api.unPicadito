import {
    buscarSalasConFiltros,
    crearNuevaSala,
    obtenerSalaConParticipantes,
    crearParticipacionEnSala,
    finalizarSalasVencidasEnBD,
    ejecutarTransaccion,
    obtenerSalaConBloqueo,
    obtenerSalaSimple,
    actualizarSala,
    verificarEsOrganizador,
    contarParticipantesConfirmados,
    obtenerParticipacion,
    eliminarParticipacion,
    guardarNuevaParticipacion,
    actualizarParticipacion,
    actualizarEstadoYRolParticipacion
} from "./sala.repository";
import { BuscarSalasQuery, CrearSalaBody, EditarSalaBody } from "./sala.schema";
import { obtenerCanchaConPredioService } from "../predio/predio.service";
import { EstadoSala, ESTADO_SALA, ROL_EN_SALA, ESTADO_PARTICIPACION, ORIGEN_INGRESO } from "../../constants/type";

const ESTADOS_CERRADOS: EstadoSala[] = [ESTADO_SALA.CANCELADA, ESTADO_SALA.FINALIZADA];
const DURACION_PARTIDO_POR_DEFECTO_MINUTOS = 60;
const MILISEGUNDOS_POR_MINUTO = 60000;
const MINUTOS_PARA_FINALIZAR = 30;

const errorHttp = (status: number, mensaje: string) => Object.assign(new Error(mensaje), { status });

export const buscarSalas = (filtros: BuscarSalasQuery, userId: number) => {
    const amigosIds: number[] = [];
    return buscarSalasConFiltros(filtros, amigosIds, userId);
};

export const obtenerDetalleSalaService = async (salaId: string) => {
    const limite = new Date(Date.now() - MINUTOS_PARA_FINALIZAR * MILISEGUNDOS_POR_MINUTO);
    await finalizarSalasVencidasEnBD(limite, salaId);

    const sala = await obtenerSalaConParticipantes(salaId);
    if (!sala) throw errorHttp(404, "Sala no encontrada");
    return sala;
};

export const crearSalaService = async (data: CrearSalaBody, userId: number) => {
    let dataFinal = { ...data };

    if (data.canchaId) {
        const cancha = await obtenerCanchaConPredioService(data.canchaId);
        dataFinal.nombreCancha = cancha.nombre;
        dataFinal.direccion = cancha.predio?.direccion || data.direccion;
        if (cancha.predio?.ubicacion) {
            dataFinal.ubicacion = {
                x: cancha.predio.ubicacion.x,
                y: cancha.predio.ubicacion.y,
            };
        }
    }

    if (!dataFinal.ubicacion) {
        throw errorHttp(400, "La ubicación de la cancha es obligatoria");
    }

    const fechaInicioNuevo = new Date(data.fechaHoraPartido);
    const fechaFinNuevo = new Date(
        fechaInicioNuevo.getTime() + DURACION_PARTIDO_POR_DEFECTO_MINUTOS * MILISEGUNDOS_POR_MINUTO
    );

    const misSalas = await buscarSalasConFiltros({ misSalas: true, pagina: 1, limite: 100 } as any, [], userId);

    for (const salaExistente of misSalas.salas) {
        const fechaInicioExistente = new Date(salaExistente.fechaHoraPartido);
        const fechaFinExistente = new Date(
            fechaInicioExistente.getTime() + DURACION_PARTIDO_POR_DEFECTO_MINUTOS * MILISEGUNDOS_POR_MINUTO
        );

        const haySolapamiento =
            fechaInicioNuevo < fechaFinExistente && fechaFinNuevo > fechaInicioExistente;

        if (haySolapamiento) {
            throw errorHttp(
                409,
                "No podés crear este partido porque ya participás en otra sala en ese horario."
            );
        }
    }

    return await ejecutarTransaccion(async (manager) => {
        const sala = await crearNuevaSala(dataFinal, userId, manager);

        await crearParticipacionEnSala(
            sala.id,
            userId,
            {
                estado: ESTADO_PARTICIPACION.CONFIRMADO,
                rol: ROL_EN_SALA.ORGANIZADOR,
                origenIngreso: ORIGEN_INGRESO.SOLICITUD_DIRECTA,
            },
            manager
        );

        return sala;
    });
};

export const editarSalaService = async (salaId: string, userId: number, datos: EditarSalaBody) => {
    return await ejecutarTransaccion(async (manager) => {
        const sala = await obtenerSalaConBloqueo(salaId, manager);
        if (!sala) throw errorHttp(404, "Sala no encontrada");

        const esOrganizador = await verificarEsOrganizador(salaId, userId, manager);
        if (!esOrganizador) throw errorHttp(403, "Solo el organizador de la sala puede editarla");

        if (ESTADOS_CERRADOS.includes(sala.estado)) throw errorHttp(409, `La sala se encuentra ${sala.estado}`);

        const ahora = Date.now();
        const fechaPartidoNueva = datos.fechaHoraPartido ?? sala.fechaHoraPartido;
        const horasHastaElPartidoActual = (sala.fechaHoraPartido.getTime() - ahora) / (1000 * 60 * 60);
        const horasHastaElPartidoNuevo = (fechaPartidoNueva.getTime() - ahora) / (1000 * 60 * 60);
        const modificaFechaOUbicacion =
            datos.fechaHoraPartido !== undefined ||
            datos.direccion !== undefined ||
            datos.nombreCancha !== undefined ||
            datos.ubicacion !== undefined;

        if (datos.fechaHoraPartido && horasHastaElPartidoNuevo <= 0) {
            throw errorHttp(400, "La nueva fecha del partido debe ser futura");
        }

        if (
            modificaFechaOUbicacion &&
            (horasHastaElPartidoActual <= 24 || horasHastaElPartidoNuevo <= 24)
        ) {
            throw errorHttp(400, "No se pueden modificar fecha u ubicación a menos de 24 horas del partido");
        }

        const datosActualizados: any = { ...datos };

        if (datos.ubicacion) {
            datosActualizados.ubicacion = `POINT(${datos.ubicacion.x} ${datos.ubicacion.y})`;
        }

        if (datos.cuposTotales !== undefined) {
            const participantesConfirmados = await contarParticipantesConfirmados(salaId, manager);

            if (datos.cuposTotales < participantesConfirmados) {
                throw errorHttp(409, "Los cupos totales no pueden ser menores que los participantes confirmados");
            }

            datosActualizados.estado = participantesConfirmados >= datos.cuposTotales ? ESTADO_SALA.COMPLETA : ESTADO_SALA.ABIERTA;
        }

        await actualizarSala(salaId, datosActualizados, manager);

        const salaActualizada = await obtenerSalaSimple(salaId, manager);
        if (!salaActualizada) throw errorHttp(404, "Sala no encontrada");

        return salaActualizada;
    });
};

export const cambiarEstadoSalaService = async (salaId: string, userId: number, motivo: string) => {
    return await ejecutarTransaccion(async (manager) => {
        const sala = await obtenerSalaConBloqueo(salaId, manager);
        if (!sala) throw errorHttp(404, "Sala no encontrada");
        if (ESTADOS_CERRADOS.includes(sala.estado)) throw errorHttp(409, `La sala se encuentra ${sala.estado}`);

        const esOrganizador = await verificarEsOrganizador(salaId, userId, manager);
        if (!esOrganizador) throw errorHttp(403, "Solo el organizador de la sala puede dar de baja");

        await actualizarSala(salaId, { estado: ESTADO_SALA.CANCELADA, motivoCancelacion: motivo }, manager);
        return { mensaje: "Sala cancelada correctamente" };
    });
};

export const leaveSalaService = async (salaId: string, userId: number) => {
    return await ejecutarTransaccion(async (manager) => {
        const sala = await obtenerSalaConBloqueo(salaId, manager, true);
        if (!sala) throw errorHttp(404, "Sala no encontrada");
        if (ESTADOS_CERRADOS.includes(sala.estado)) throw errorHttp(409, `La sala se encuentra ${sala.estado}`);

        const participacion = sala.participantes?.find((p) => p.usuario?.id === userId);
        if (!participacion) throw errorHttp(404, "No estás participando en esta sala");
        if (participacion.rol === ROL_EN_SALA.ORGANIZADOR && participacion.estado === ESTADO_PARTICIPACION.CONFIRMADO) {
            throw errorHttp(409, "El organizador no puede salir de sala, debe transferir el rol o cancelarla.");
        }

        await eliminarParticipacion(participacion.id, manager);

        if (sala.estado === ESTADO_SALA.COMPLETA) {
            const confirmados = await contarParticipantesConfirmados(salaId, manager);
            if (confirmados < sala.cuposTotales) {
                await actualizarSala(salaId, { estado: ESTADO_SALA.ABIERTA }, manager);
            }
        }

        return { salaId, userId, message: "Has salido de la sala correctamente" };
    });
};

export const unirseSalaService = async (salaId: string, userId: number) => {
    return await ejecutarTransaccion(async (manager) => {
        const sala = await obtenerSalaConBloqueo(salaId, manager, true);
        if (!sala) throw errorHttp(404, "Sala no encontrada");
        if (sala.estado !== ESTADO_SALA.ABIERTA && sala.estado !== ESTADO_SALA.COMPLETA) {
            throw errorHttp(409, `La sala se encuentra ${sala.estado}`);
        }
        if (new Date(sala.fechaHoraPartido) <= new Date()) {
            throw errorHttp(400, "No puedes unirte a un partido que ya finalizó o está en curso");
        }
        if (sala.participantes?.some((p) => p.usuario?.id === userId)) {
            throw errorHttp(409, "Ya formas parte de esta sala");
        }

        const confirmados = sala.participantes?.filter((p) => p.estado === ESTADO_PARTICIPACION.CONFIRMADO).length ?? 0;
        const hayCupo = confirmados < sala.cuposTotales;

        if (!hayCupo && !sala.permiteSuplentes) {
            throw errorHttp(409, "La sala está completa");
        }

        if (!hayCupo) {
            const suplentesConfirmados = sala.participantes?.filter(
                (p) => p.rol === ROL_EN_SALA.SUPLENTE && p.estado === ESTADO_PARTICIPACION.CONFIRMADO
            ).length ?? 0;

            if (suplentesConfirmados >= sala.cuposSuplentesMax) {
                throw errorHttp(409, "La sala alcanzó el máximo de suplentes permitido");
            }
        }

        if (!sala.esPublica) {
            const participacion = await guardarNuevaParticipacion({
                sala: { id: salaId },
                usuario: { id: userId },
                estado: ESTADO_PARTICIPACION.PENDIENTE,
                rol: ROL_EN_SALA.SOLICITANTE,
                origenIngreso: ORIGEN_INGRESO.SOLICITUD_DIRECTA,
            }, manager);

            return {
                mensaje: "Tu solicitud fue enviada y está pendiente de aprobación",
                requiereAprobacion: true,
                participacion,
            };
        }

        const rol = hayCupo ? ROL_EN_SALA.TITULAR : ROL_EN_SALA.SUPLENTE;
        const participacion = await guardarNuevaParticipacion({
            sala: { id: salaId },
            usuario: { id: userId },
            estado: ESTADO_PARTICIPACION.CONFIRMADO,
            rol,
            origenIngreso: ORIGEN_INGRESO.SOLICITUD_DIRECTA,
        }, manager);

        if (rol === ROL_EN_SALA.TITULAR && confirmados + 1 >= sala.cuposTotales) {
            await actualizarSala(salaId, { estado: ESTADO_SALA.COMPLETA }, manager);
        }

        return { mensaje: "Te uniste a la sala correctamente", rol, participacion };
    });
};

export const expulsarJugadorService = async (salaId: string, userIdAExpulsar: number, organizadorId: number) => {
    return await ejecutarTransaccion(async (manager) => {
        const sala = await obtenerSalaConBloqueo(salaId, manager, true);
        if (!sala) throw errorHttp(404, "Sala no encontrada");
        if (ESTADOS_CERRADOS.includes(sala.estado)) throw errorHttp(409, `La sala se encuentra ${sala.estado}`);

        const esOrganizador = await verificarEsOrganizador(salaId, organizadorId, manager);
        if (!esOrganizador) throw errorHttp(403, "Solo el organizador de la sala puede expulsar jugadores");
        if (userIdAExpulsar === organizadorId) {
            throw errorHttp(409, "No puedes expulsarte a ti mismo de esta forma. Debes cancelar la sala.");
        }

        const participacion = sala.participantes?.find((p) => p.usuario?.id === userIdAExpulsar);
        if (!participacion) throw errorHttp(404, "El jugador no está participando en esta sala");

        await eliminarParticipacion(participacion.id, manager);

        if (sala.estado === ESTADO_SALA.COMPLETA) {
            const confirmados = await contarParticipantesConfirmados(salaId, manager);
            if (confirmados < sala.cuposTotales) {
                await actualizarSala(salaId, { estado: ESTADO_SALA.ABIERTA }, manager);
            }
        }

        return {
            salaId,
            userIdExpulsado: userIdAExpulsar,
            mensaje: "Jugador expulsado correctamente",
        };
    });
};

export const transferirOrganizadorService = async (
    salaId: string,
    userId: number,
    nuevoOrganizadorId: number,
) => {
    return await ejecutarTransaccion(async (manager) => {
        const sala = await obtenerSalaConBloqueo(salaId, manager);
        if (!sala) throw errorHttp(404, "Sala no encontrada");
        if (ESTADOS_CERRADOS.includes(sala.estado)) throw errorHttp(409, `La sala se encuentra ${sala.estado}`);
        if (nuevoOrganizadorId === userId) throw errorHttp(409, "No puedes transferirte la organización a ti mismo");

        const organizadorActual = await obtenerParticipacion({
            sala: { id: salaId },
            usuario: { id: userId },
            rol: ROL_EN_SALA.ORGANIZADOR,
            estado: ESTADO_PARTICIPACION.CONFIRMADO,
        }, manager);
        if (!organizadorActual) throw errorHttp(403, "Solo el organizador de la sala puede transferir el rol");

        const nuevoOrganizador = await obtenerParticipacion({
            sala: { id: salaId },
            usuario: { id: nuevoOrganizadorId },
            estado: ESTADO_PARTICIPACION.CONFIRMADO,
        }, manager);
        if (!nuevoOrganizador) throw errorHttp(404, "El nuevo organizador debe ser un participante confirmado de la sala");

        await actualizarParticipacion(organizadorActual.id, { rol: ROL_EN_SALA.TITULAR }, manager);
        await actualizarParticipacion(nuevoOrganizador.id, { rol: ROL_EN_SALA.ORGANIZADOR }, manager);

        return {
            message: "Organización transferida correctamente",
            anteriorOrganizadorId: userId,
            nuevoOrganizadorId,
        };
    });
};

export const aceptarSolicitudService = async (
    salaId: string,
    participacionId: string,
    organizadorId: number,
) => {
    return await ejecutarTransaccion(async (manager) => {
        const sala = await obtenerSalaConBloqueo(salaId, manager);
        if (!sala) throw errorHttp(404, "Sala no encontrada");
        if (ESTADOS_CERRADOS.includes(sala.estado)) throw errorHttp(409, `La sala se encuentra ${sala.estado}`);

        const esOrganizador = await verificarEsOrganizador(salaId, organizadorId, manager);
        if (!esOrganizador) throw errorHttp(403, "Solo el organizador de la sala puede aceptar solicitudes");

        const participacion = await obtenerParticipacion({ id: participacionId }, manager, { sala: true, usuario: true });

        if (!participacion) throw errorHttp(404, "Participación no encontrada");
        if (participacion.sala?.id !== salaId) {
            throw errorHttp(404, "La participación no corresponde a esta sala");
        }
        if (participacion.rol !== ROL_EN_SALA.SOLICITANTE) {
            throw errorHttp(409, "Esta participación no es una solicitud de ingreso");
        }
        if (participacion.estado !== ESTADO_PARTICIPACION.PENDIENTE) {
            throw errorHttp(409, "Esta solicitud ya fue procesada anteriormente");
        }

        const confirmados = await contarParticipantesConfirmados(salaId, manager);

        if (confirmados >= sala.cuposTotales) {
            throw errorHttp(409, "La sala está completa, no hay cupos titulares disponibles");
        }

        await actualizarEstadoYRolParticipacion(
            participacionId,
            ROL_EN_SALA.TITULAR,
            ESTADO_PARTICIPACION.CONFIRMADO,
            manager,
        );

        if (confirmados + 1 >= sala.cuposTotales) {
            await actualizarSala(salaId, { estado: ESTADO_SALA.COMPLETA }, manager);
        }

        return {
            mensaje: "Solicitud de ingreso aceptada correctamente",
            participacionId,
            nuevoRol: ROL_EN_SALA.TITULAR,
            nuevoEstado: ESTADO_PARTICIPACION.CONFIRMADO,
        };
    });
};

export const rechazarSolicitudService = async (
    salaId: string,
    participacionId: string,
    organizadorId: number,
) => {
    return await ejecutarTransaccion(async (manager) => {
        const esOrganizador = await verificarEsOrganizador(salaId, organizadorId, manager);
        if (!esOrganizador) throw errorHttp(403, "Solo el organizador de la sala puede rechazar solicitudes");

        const participacion = await obtenerParticipacion({ id: participacionId }, manager, { sala: true });

        if (!participacion) throw errorHttp(404, "Participación no encontrada");
        if (participacion.sala?.id !== salaId) {
            throw errorHttp(404, "La participación no corresponde a esta sala");
        }
        if (participacion.rol !== ROL_EN_SALA.SOLICITANTE) {
            throw errorHttp(409, "Esta participación no es una solicitud de ingreso");
        }

        await eliminarParticipacion(participacionId, manager);

        return {
            mensaje: "Solicitud de ingreso rechazada correctamente",
            participacionId,
        };
    });
};

export const finalizarSalaService = async (salaId: string, userId: number) => {
    return await ejecutarTransaccion(async (manager) => {
        const sala = await obtenerSalaConBloqueo(salaId, manager);
        if (!sala) throw errorHttp(404, "Sala no encontrada");

        const esOrganizador = await verificarEsOrganizador(salaId, userId, manager);
        if (!esOrganizador) throw errorHttp(403, "Solo el organizador de la sala puede finalizarla");

        if (ESTADOS_CERRADOS.includes(sala.estado)) throw errorHttp(409, `La sala se encuentra ${sala.estado}`);

        const habilitadaDesde =
            new Date(sala.fechaHoraPartido).getTime() + MINUTOS_PARA_FINALIZAR * MILISEGUNDOS_POR_MINUTO;
        if (Date.now() < habilitadaDesde) {
            throw errorHttp(
                400,
                `La sala solo puede finalizarse ${MINUTOS_PARA_FINALIZAR} minutos después del horario del partido`,
            );
        }

        await actualizarSala(salaId, { estado: ESTADO_SALA.FINALIZADA }, manager);

        return { salaId, estado: ESTADO_SALA.FINALIZADA, mensaje: "Sala finalizada correctamente" };
    });
};

export const finalizarSalasVencidasService = async (): Promise<number> => {
    const limite = new Date(Date.now() - MINUTOS_PARA_FINALIZAR * MILISEGUNDOS_POR_MINUTO);
    return finalizarSalasVencidasEnBD(limite);
};
