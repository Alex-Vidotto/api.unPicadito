import { AppDataSource } from "../../database/data-source";
import { Review } from "./review.entity";

export const repo = () => AppDataSource.getRepository(Review);

export const createReview = async (data: Partial<Review>) => {
  return repo().save(repo().create(data));
};


export const getAverageRating = async (calificadoId: number) => {
  const result = await repo()
    .createQueryBuilder("review")
    .select("AVG(review.estrellas)", "promedio")
    .addSelect("COUNT(review.id)", "total_resenas")
    .where("review.calificado_id = :id", { id: calificadoId })
    .getRawOne();

  return {
    promedio: parseFloat(result.promedio) || 0,
    totalResenas: parseInt(result.total_resenas) || 0
  };
};


export const getReviewsByCalificadoId = async (calificadoId: number) => {
  return await repo().find({
    where: { calificado: { id: calificadoId } },
    relations: {
      calificador: true,
    },
    order: { creadoEn: 'DESC' },
  });
};