import { AppDataSource } from "../../database/data-source.js";
import { Review } from "./review.entity.js";

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