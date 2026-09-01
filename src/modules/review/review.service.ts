import { createReview, getAverageRating } from './review.repository';
import { Review } from './review.entity';

export const ReviewService = {
    guardarResena: async (datos: Partial<Review>) => {
        const { calificador, calificado, estrellas } = datos;
        if (!estrellas || estrellas < 1 || estrellas > 5) throw new Error("La calificación debe ser entre 1 y 5 estrellas.");
        const idCalificador = typeof calificador === 'string' ? calificador : calificador?.id;
        const idCalificado = typeof calificado === 'string' ? calificado : calificado?.id;
        
        if (idCalificador === idCalificado) throw new Error("Un jugador no puede calificarse a sí mismo.");
        return await createReview(datos);
    },
    obtenerRankingJugador: async (userId: number) => {
        if (!userId) throw new Error("El ID del jugador es obligatorio.");
        return await getAverageRating(userId);
    }
};
