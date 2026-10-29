import { createReview, getAverageRating } from './review.repository';

export const guardarResena = async (datos: any, calificadorId: number) => {
    const { calificadoId, calificado, salaId, sala, estrellas, comentario } = datos;

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

    return await createReview({
        estrellas,
        comentario,
        calificador: { id: calificadorId } as any,
        calificado: { id: idCalificado } as any,
        ...(targetSalaId ? { sala: { id: targetSalaId } as any } : {})
    });
};

export const obtenerRankingJugador = async (userId: number) => {
    if (!userId) {
        throw new Error("El ID del jugador es obligatorio.");
    }
    return await getAverageRating(userId);
};

export const ReviewService = {
    guardarResena,
    obtenerRankingJugador
};
