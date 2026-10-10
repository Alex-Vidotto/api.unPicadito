import {
    buscarSalasConFiltros,
    crearNuevaSala,
    obtenerSalaConParticipantes,
    crearParticipacionEnSala,
    obtenerParticipacionPorId,
    actualizarRolParticipacion,
    actualizarEstadoSalaEnBD,
    contarParticipantesConfirmados,
    esOrganizadorDeSala,
} from "./sala.repository";
import { BuscarSalasQuery, CrearSalaBody, EditarSalaBody } from "./sala.schema";
import { Sala } from "./sala.entity";
import { AppDataSource } from "../../database/data-source";
import { ParticipacionSala } from "../participacionSala/participacionSala.entity";

const ESTADOS_CERRADOS = ["CANCELADA", "FINALIZADA"];

const errorHttp = (status: number, mensaje: string) => Object.assign(new Error(mensaje), { status });

export const buscarSalas = (filtros: BuscarSalasQuery, userId: number) => {
    const amigosIds: number[] = [];
    return buscarSalasConFiltros(filtros, amigosIds, userId);
};

export const obtenerDetalleSalaService = async (salaId: string) => {
    const sala = await obtenerSalaConParticipantes(salaId);
    if (!sala) throw errorHttp(404, "Sala no encontrada");
    return sala;
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

export const editarSalaService = async (salaId: string, userId: number, datos: EditarSalaBody) => {
    return AppDataSource.transaction(async (manager) => {
        const sala = await manager.createQueryBuilder(Sala, "sala")
            .leftJoinAndSelect("sala.creador", "creador")
            .setLock("pessimistic_write")
            .where("sala.id = :salaId", { salaId })
            .getOne();

        if (!sala) throw errorHttp(404, "Sala no encontrada");

        const esOrganizador = await manager.count(ParticipacionSala, {
            where: {
                sala: { id: salaId },
                usuario: { id: userId },
                rol: "ORGANIZADOR",
                estado: "CONFIRMADO",
            },
        });
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

        const datosActualizados: Partial<Sala> = { ...datos };

        if (datos.ubicacion) {
            datosActualizados.ubicacion = `POINT(${datos.ubicacion.x} ${datos.ubicacion.y})` as any;
        }

        if (datos.cuposTotales !== undefined) {
            const participantesConfirmados = await manager.count(ParticipacionSala, {
                where: { sala: { id: salaId }, estado: "CONFIRMADO" },
            });

            if (datos.cuposTotales < participantesConfirmados) {
                throw errorHttp(409, "Los cupos totales no pueden ser menores que los participantes confirmados");
            }

            datosActualizados.estado = participantesConfirmados >= datos.cuposTotales ? "COMPLETA" : "ABIERTA";
        }

        await manager.update(Sala, salaId, datosActualizados);

        const salaActualizada = await manager.findOne(Sala, { where: { id: salaId } });
        if (!salaActualizada) throw errorHttp(404, "Sala no encontrada");

        return salaActualizada;
    });
};

export const cambiarEstadoSalaService = async (salaId: string, userId: number, motivo: string) => {
    return AppDataSource.transaction(async (manager) => {
        const sala = await manager.createQueryBuilder(Sala, "sala")
            .setLock("pessimistic_write")
            .where("sala.id = :salaId", { salaId })
            .getOne();

        if (!sala) throw errorHttp(404, "Sala no encontrada");
        if (ESTADOS_CERRADOS.includes(sala.estado)) throw errorHttp(409, `La sala se encuentra ${sala.estado}`);

        const esOrganizador = await manager.count(ParticipacionSala, {
            where: {
                sala: { id: salaId },
                usuario: { id: userId },
                rol: "ORGANIZADOR",
                estado: "CONFIRMADO",
            },
        });
        if (!esOrganizador) throw errorHttp(403, "Solo el organizador de la sala puede dar de baja");

        await manager.update(Sala, salaId, { estado: "CANCELADA", motivoCancelacion: motivo });
        return { mensaje: "Sala cancelada correctamente" };
    });
};

export const leaveSalaService = async (salaId: string, userId: number) => {
    return AppDataSource.transaction(async (manager) => {
        const sala = await manager.createQueryBuilder(Sala, "sala")
            .leftJoinAndSelect("sala.participantes", "participacion")
            .leftJoinAndSelect("participacion.usuario", "usuario")
            .setLock("pessimistic_write")
            .where("sala.id = :salaId", { salaId })
            .getOne();

        if (!sala) throw errorHttp(404, "Sala no encontrada");
        if (ESTADOS_CERRADOS.includes(sala.estado)) throw errorHttp(409, `La sala se encuentra ${sala.estado}`);

        const participacion = sala.participantes?.find((p) => p.usuario?.id === userId);
        if (!participacion) throw errorHttp(404, "No estás participando en esta sala");
        if (participacion.rol === "ORGANIZADOR" && participacion.estado === "CONFIRMADO") {
            throw errorHttp(409, "El organizador no puede salir de sala, debe transferir el rol o cancelarla.");
        }

        await manager.delete(ParticipacionSala, participacion.id);

        if (sala.estado === "COMPLETA") {
            const confirmados = await manager.count(ParticipacionSala, {
                where: { sala: { id: salaId }, estado: "CONFIRMADO" },
            });
            if (confirmados < sala.cuposTotales) {
                await manager.update(Sala, salaId, { estado: "ABIERTA" });
            }
        }

        return { salaId, userId, message: "Has salido de la sala correctamente" };
    });
};

export const unirseSalaService = async (salaId: string, userId: number) => {
    return AppDataSource.transaction(async (manager) => {
        const sala = await manager.createQueryBuilder(Sala, "sala")
            .leftJoinAndSelect("sala.participantes", "participacion")
            .leftJoinAndSelect("participacion.usuario", "usuario")
            .setLock("pessimistic_write")
            .where("sala.id = :salaId", { salaId })
            .getOne();

        if (!sala) throw errorHttp(404, "Sala no encontrada");
        if (!["ABIERTA", "COMPLETA"].includes(sala.estado)) throw errorHttp(409, `La sala se encuentra ${sala.estado}`);
        if (sala.participantes?.some((p) => p.usuario?.id === userId)) throw errorHttp(409, "Ya formas parte de esta sala");

        const confirmados = sala.participantes?.filter((p) => p.estado === "CONFIRMADO").length ?? 0;
        const hayCupo = confirmados < sala.cuposTotales;

        if (!hayCupo && !sala.permiteSuplentes) throw errorHttp(409, "La sala está completa");

        if (!sala.esPublica) {
            const nuevaParticipacion = manager.create(ParticipacionSala, {
                sala: { id: salaId },
                usuario: { id: userId },
                estado: "PENDIENTE",
                rol: "SOLICITANTE",
                origenIngreso: "SOLICITUD_DIRECTA",
            });
            const participacion = await manager.save(nuevaParticipacion);

            return {
                mensaje: "Tu solicitud fue enviada y está pendiente de aprobación",
                requiereAprobacion: true,
                participacion,
            };
        }

        const rol = hayCupo ? "TITULAR" : "SUPLENTE";
        const nuevaParticipacion = manager.create(ParticipacionSala, {
            sala: { id: salaId },
            usuario: { id: userId },
            estado: "CONFIRMADO",
            rol,
            origenIngreso: "SOLICITUD_DIRECTA",
        });
        const participacion = await manager.save(nuevaParticipacion);

        if (rol === "TITULAR" && confirmados + 1 >= sala.cuposTotales) {
            await manager.update(Sala, salaId, { estado: "COMPLETA" });
        }

        return { mensaje: "Te uniste a la sala correctamente", rol, participacion };
    });
};

export const expulsarJugadorService = async (salaId: string, userIdAExpulsar: number, organizadorId: number) => {
    return AppDataSource.transaction(async (manager) => {
        const sala = await manager.createQueryBuilder(Sala, "sala")
            .leftJoinAndSelect("sala.participantes", "participacion")
            .leftJoinAndSelect("participacion.usuario", "usuario")
            .setLock("pessimistic_write")
            .where("sala.id = :salaId", { salaId })
            .getOne();

        if (!sala) throw errorHttp(404, "Sala no encontrada");
        if (ESTADOS_CERRADOS.includes(sala.estado)) throw errorHttp(409, `La sala se encuentra ${sala.estado}`);

        const esOrganizador = await manager.count(ParticipacionSala, {
            where: {
                sala: { id: salaId },
                usuario: { id: organizadorId },
                rol: "ORGANIZADOR",
                estado: "CONFIRMADO",
            },
        });
        if (!esOrganizador) throw errorHttp(403, "Solo el organizador de la sala puede expulsar jugadores");
        if (userIdAExpulsar === organizadorId) {
            throw errorHttp(409, "No puedes expulsarte a ti mismo de esta forma. Debes cancelar la sala.");
        }

        const participacion = sala.participantes?.find((p) => p.usuario?.id === userIdAExpulsar);
        if (!participacion) throw errorHttp(404, "El jugador no está participando en esta sala");

        await manager.delete(ParticipacionSala, participacion.id);

        if (sala.estado === "COMPLETA") {
            const confirmados = await manager.count(ParticipacionSala, {
                where: { sala: { id: salaId }, estado: "CONFIRMADO" },
            });
            if (confirmados < sala.cuposTotales) {
                await manager.update(Sala, salaId, { estado: "ABIERTA" });
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
    return AppDataSource.transaction(async (manager) => {
        const sala = await manager.createQueryBuilder(Sala, "sala")
            .setLock("pessimistic_write")
            .where("sala.id = :salaId", { salaId })
            .getOne();

        if (!sala) throw errorHttp(404, "Sala no encontrada");
        if (ESTADOS_CERRADOS.includes(sala.estado)) throw errorHttp(409, `La sala se encuentra ${sala.estado}`);
        if (nuevoOrganizadorId === userId) throw errorHttp(409, "No puedes transferirte la organización a ti mismo");

        const organizadorActual = await manager.findOne(ParticipacionSala, {
            where: {
                sala: { id: salaId },
                usuario: { id: userId },
                rol: "ORGANIZADOR",
                estado: "CONFIRMADO",
            },
        });
        if (!organizadorActual) throw errorHttp(403, "Solo el organizador de la sala puede transferir el rol");

        const nuevoOrganizador = await manager.findOne(ParticipacionSala, {
            where: {
                sala: { id: salaId },
                usuario: { id: nuevoOrganizadorId },
                estado: "CONFIRMADO",
            },
        });
        if (!nuevoOrganizador) throw errorHttp(404, "El nuevo organizador debe ser un participante confirmado de la sala");

        await manager.update(ParticipacionSala, organizadorActual.id, { rol: "TITULAR" });
        await manager.update(ParticipacionSala, nuevoOrganizador.id, { rol: "ORGANIZADOR" });

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
    // verificar que quien ejecuta sea el organizador de la sala
    if (!(await esOrganizadorDeSala(salaId, organizadorId))) {
        throw errorHttp(403, "Solo el organizador puede aceptar solicitudes")
    }

    // obtener la paricipacion solicitada
    const participacion = await obtenerParticipacionPorId(participacionId);
    if (!participacion) throw errorHttp(404, "Participación no encontrada");

    // verificar que la participacion pertenezca a esta sala
    if (participacion.sala.id !== salaId) {
        throw errorHttp(404, "La participacion no corresponde a esta sala");
    }

    // verificar que la sala no estee cerrada
    if (ESTADOS_CERRADOS.includes(participacion.sala.estado)) {
        throw errorHttp(409, "La sala se encuentra cerrada");
    }

    //  Verificar que el rol sea SOLICITANTE
    if (participacion.rol !== "SOLICITANTE") {
        throw errorHttp(409, "Esta participación no es una solicitud pendiente de ingreso");
    }

    //  Verificar que el estado sea PENDIENTE
    if (participacion.estado !== "PENDIENTE") {
        throw errorHttp(409, "Esta solicitud ya fue procesada anteriormente");
    }

    //  Verificar disponibilidad de cupo
    const confirmados = await contarParticipantesConfirmados(salaId);
    if (confirmados >= participacion.sala.cuposTotales) {
        throw errorHttp(409, "La sala está completa, no hay cupo disponible");
    }

    //  Aceptar: SOLICITANTE + PENDIENTE → TITULAR + CONFIRMADO
    await actualizarRolParticipacion(participacionId, "TITULAR");

    // Si la sala se llenó, actualizar su estado a COMPLETA
    if (confirmados + 1 >= participacion.sala.cuposTotales) {
        await actualizarEstadoSalaEnBD(salaId, "COMPLETA");
    }

    return {
        mensaje: "Solicitud de ingreso aceptada correctamente",
        participacionId,
        nuevoRol: "TITULAR",
        nuevoEstado: "CONFIRMADO",
    };
};
