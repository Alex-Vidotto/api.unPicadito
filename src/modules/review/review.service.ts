import { AppDataSource } from '../../database/data-source';
import {
    guardarReview,
    calcularPromedio,
    actualizarReputacion,
    existeUsuario,
    existeReview,
    obtenerSala,
    participoConfirmado,
    bloquearUsuario,
} from './review.repository';
import { AppDataSource } from "../../database/data-source";
import { CrearReviewBody } from "./review.schema";
import {
    bloquearUsuario,
    obtenerSala,
    participoConfirmado,
    existeReview,
    guardarReview,
    calcularPromedio,
    actualizarReputacion,
    existeUsuario,
} from "./review.repository";

const errorHttp = (status: number, mensaje: string) => Object.assign(new Error(mensaje), { status });

export const crearReviewService = async (datos: CrearReviewBody, calificadorId: number) => {
    const { calificadoId, salaId, estrellas, comentario } = datos;

    if (!estrellas || estrellas < 1 || estrellas > 5) {
        throw new Error("La calificación debe ser entre 1 y 5 estrellas.");
    }

    const targetCalificado = calificadoId ?? (typeof calificado === 'object' ? calificado?.id : calificado);
    const idCalificado = Number(targetCalificado);

    if (!idCalificado) {
        throw new Error("El usuario a calificar es obligatorio.");
    }

    if (calificadorId === idCalificado) {
        throw new Error("Un jugador no puede calificarse a sí mismo.");
    }

    const targetSalaId = salaId ?? (typeof sala === 'object' ? sala?.id : sala);
    if (!targetSalaId) {
        throw new Error("El ID de la sala es obligatorio.");
    }

    return await AppDataSource.transaction(async (manager) => {
        const calificadoUser = await bloquearUsuario(manager, idCalificado);
        if (!calificadoUser) throw new Error("Jugador no encontrado.");

        const salaEncontrada = await obtenerSala(manager, targetSalaId);
        if (!salaEncontrada) throw new Error("Sala no encontrada.");
        if (salaEncontrada.estado === "CANCELADA") {
            throw new Error("No se puede calificar en una sala cancelada.");
        }
        if (salaEncontrada.fechaHoraPartido.getTime() > Date.now()) {
            throw new Error("Solo se puede calificar después de que se juegue el partido.");
        }

        const calificadorJugo = await participoConfirmado(manager, targetSalaId, calificadorId);
        if (!calificadorJugo) {
            throw new Error("Solo podés calificar partidos en los que participaste.");
        }

        const calificadoJugo = await participoConfirmado(manager, targetSalaId, idCalificado);
        if (!calificadoJugo) {
            throw new Error("El jugador calificado no participó en este partido.");
        }

        const yaCalificado = await existeReview(manager, targetSalaId, calificadorId, idCalificado);
        if (yaCalificado) {
            throw new Error("Ya calificaste a este jugador en este partido.");
        }

        const reviewGuardada = await guardarReview(manager, {
            salaId: targetSalaId,
            calificadorId,
            calificadoId: idCalificado,
            estrellas,
            comentario,
        });

        const ranking = await calcularPromedio(manager, idCalificado);
        await actualizarReputacion(manager, idCalificado, ranking.promedio);

        return {
            id: reviewGuardada.id,
            estrellas: reviewGuardada.estrellas,
            comentario: reviewGuardada.comentario,
            creadoEn: reviewGuardada.creadoEn,
            ranking,
        };
        if (calificadoId === calificadorId) throw errorHttp(400, "Un jugador no puede calificarse a sí mismo.");

        return AppDataSource.transaction(async (manager) => {
            const calificado = await bloquearUsuario(manager, calificadoId);
            if (!calificado) throw errorHttp(404, "Jugador no encontrado");

            const sala = await obtenerSala(manager, salaId);
            if (!sala) throw errorHttp(404, "Sala no encontrada");
            if (sala.estado === "CANCELADA") throw errorHttp(409, "No se puede calificar en una sala cancelada");
            if (sala.fechaHoraPartido.getTime() > Date.now()) {
                throw errorHttp(409, "Solo se puede calificar después de que se juegue el partido");
            }

            const calificadorJugo = await participoConfirmado(manager, salaId, calificadorId);
            if (!calificadorJugo) throw errorHttp(403, "Solo podés calificar partidos en los que participaste");

            const calificadoJugo = await participoConfirmado(manager, salaId, calificadoId);
            if (!calificadoJugo) throw errorHttp(409, "El jugador calificado no participó en este partido");

            const yaCalificado = await existeReview(manager, salaId, calificadorId, calificadoId);
            if (yaCalificado) throw errorHttp(409, "Ya calificaste a este jugador en este partido");

            const reviewGuardada = await guardarReview(manager, {
                salaId,
                calificadorId,
                calificadoId,
                estrellas,
                comentario,
            });

            const ranking = await calcularPromedio(manager, calificadoId);
            await actualizarReputacion(manager, calificadoId, ranking.promedio);

            return {
                id: reviewGuardada.id,
                estrellas: reviewGuardada.estrellas,
                comentario: reviewGuardada.comentario,
                creadoEn: reviewGuardada.creadoEn,
                ranking,
            };
        });
    };

    export const obtenerRankingJugador = async (userId: number) => {
        if (!userId) {
            throw new Error("El ID del jugador es obligatorio.");
        }

        const existe = await existeUsuario(AppDataSource.manager, userId);
        if (!existe) {
            throw new Error("Jugador no encontrado.");
        }

        return await calcularPromedio(AppDataSource.manager, userId);
    };

    export const ReviewService = {
        guardarResena,
        obtenerRankingJugador,
    };

    export const obtenerRankingService = async (calificadoId: number) => {
        const existe = await existeUsuario(AppDataSource.manager, calificadoId);
        if (!existe) throw errorHttp(404, "Jugador no encontrado");

        return calcularPromedio(AppDataSource.manager, calificadoId);
    };
