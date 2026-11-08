import { AppDataSource } from "../../database/data-source";
import { CrearReviewBody } from "./review.schema";
import {
    bloquearUsuario,
    obtenerSala,
    participoConfirmado,
    existeReview,
    tieneReviewReciente,
    guardarReview,
    calcularPromedio,
    actualizarReputacion,
    existeUsuario,
    obtenerParticipacionesConfirmadasDeSala,
    obtenerIdsCalificadosEnSala,
    obtenerBloqueadosRecientes,
} from "./review.repository";

const DIAS_ESPERA_RESENA = 14;

const errorHttp = (status: number, mensaje: string) =>
    Object.assign(new Error(mensaje), { status });

const esErrorDuplicado = (error: unknown): boolean => {
    if (typeof error !== "object" || error === null) return false;
    const err = error as { code?: string; errno?: number };
    return err.code === "ER_DUP_ENTRY" || err.errno === 1062;
};

export const crearReviewService = async (
    datos: CrearReviewBody,
    calificadorId: number,
) => {
    const { calificadoId, salaId, estrellas, comentario } = datos;

    if (calificadoId === calificadorId) {
        throw errorHttp(400, "Un jugador no puede calificarse a sí mismo.");
    }

    return AppDataSource.transaction(async (manager) => {
        const sala = await obtenerSala(manager, salaId);
        if (!sala) throw errorHttp(404, "Sala no encontrada");
        if (sala.estado !== "FINALIZADA") {
            throw errorHttp(
                409,
                `Solo se puede calificar cuando la sala está FINALIZADA (estado actual: ${sala.estado})`,
            );
        }

        const calificadorJugo = await participoConfirmado(
            manager,
            salaId,
            calificadorId,
        );
        if (!calificadorJugo) {
            throw errorHttp(
                403,
                "Solo los participantes confirmados de la sala pueden calificar",
            );
        }

        const calificadoJugo = await participoConfirmado(
            manager,
            salaId,
            calificadoId,
        );
        if (!calificadoJugo) {
            throw errorHttp(
                404,
                "El jugador a calificar no fue participante confirmado de esta sala",
            );
        }

        const calificado = await bloquearUsuario(manager, calificadoId);
        if (!calificado) throw errorHttp(404, "Jugador no encontrado");

        const yaCalificado = await existeReview(
            manager,
            salaId,
            calificadorId,
            calificadoId,
        );
        if (yaCalificado) {
            throw errorHttp(
                409,
                "Ya calificaste a este jugador en este partido",
            );
        }

        const calificadoReciente = await tieneReviewReciente(
            manager,
            calificadorId,
            calificadoId,
            DIAS_ESPERA_RESENA,
        );
        if (calificadoReciente) {
            throw errorHttp(
                429,
                `Ya calificaste a este jugador en los últimos ${DIAS_ESPERA_RESENA} días`,
            );
        }

        let reviewGuardada;
        try {
            reviewGuardada = await guardarReview(manager, {
                salaId,
                calificadorId,
                calificadoId,
                estrellas,
                comentario,
            });
        } catch (error) {
            if (esErrorDuplicado(error)) {
                throw errorHttp(
                    409,
                    "Ya calificaste a este jugador en este partido",
                );
            }
            throw error;
        }

        const ranking = await calcularPromedio(manager, calificadoId);
        await actualizarReputacion(manager, calificadoId, ranking.promedio);

        return {
            review: {
                id: reviewGuardada.id,
                salaId,
                calificadoId,
                estrellas: reviewGuardada.estrellas,
                comentario: reviewGuardada.comentario ?? null,
                creadoEn: reviewGuardada.creadoEn,
            },
            reputacionCalificado: ranking.promedio,
            totalResenas: ranking.totalResenas,
        };
    });
};

export const obtenerRankingService = async (calificadoId: number) => {
    const existe = await existeUsuario(AppDataSource.manager, calificadoId);
    if (!existe) throw errorHttp(404, "Jugador no encontrado");

    return calcularPromedio(AppDataSource.manager, calificadoId);
};

export const obtenerPendientesCalificarService = async (
    salaId: string,
    userId: number,
) => {
    const sala = await obtenerSala(AppDataSource.manager, salaId);
    if (!sala) throw errorHttp(404, "Sala no encontrada");
    if (sala.estado !== "FINALIZADA") {
        throw errorHttp(
            409,
            `La sala todavía no está FINALIZADA (estado actual: ${sala.estado})`,
        );
    }

    const participaciones =
        await obtenerParticipacionesConfirmadasDeSala(salaId);

    if (!participaciones.some((p) => p.usuario.id === userId)) {
        throw errorHttp(
            403,
            "Solo los participantes confirmados de la sala pueden calificar",
        );
    }

    const companeros = participaciones.filter((p) => p.usuario.id !== userId);
    if (companeros.length === 0) return { salaId, pendientes: [] };

    const [yaCalificados, bloqueados] = await Promise.all([
        obtenerIdsCalificadosEnSala(salaId, userId),
        obtenerBloqueadosRecientes(userId, DIAS_ESPERA_RESENA),
    ]);

    const pendientes = companeros
        .filter((p) => !yaCalificados.has(p.usuario.id))
        .map((p) => ({
            userId: p.usuario.id,
            nombre: p.usuario.nombre,
            apellido: p.usuario.apellido,
            nombreUsuario: p.usuario.nombreUsuario,
            fotoPerfilUrl: p.usuario.fotoPerfilUrl ?? null,
            posicionPrincipal: p.usuario.posicionPrincipal,
            puedeCalificar: !bloqueados.has(p.usuario.id),
            diasRestantes: bloqueados.get(p.usuario.id) ?? 0,
        }));

    return { salaId, pendientes };
};
