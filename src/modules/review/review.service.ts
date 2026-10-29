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

export const obtenerRankingService = async (calificadoId: number) => {
    const existe = await existeUsuario(AppDataSource.manager, calificadoId);
    if (!existe) throw errorHttp(404, "Jugador no encontrado");

    return calcularPromedio(AppDataSource.manager, calificadoId);
};
