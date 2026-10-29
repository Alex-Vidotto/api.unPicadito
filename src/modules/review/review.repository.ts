import { EntityManager } from "typeorm";
import { Review } from "./review.entity";
import { User } from "../user/user.entity";
import { Sala } from "../sala/sala.entity";
import { ParticipacionSala } from "../participacionSala/participacionSala.entity";


export const bloquearUsuario = (manager: EntityManager, userId: number) =>
    manager.createQueryBuilder(User, "usuario")
        .setLock("pessimistic_write")
        .where("usuario.id = :userId", { userId })
        .getOne();

export const existeUsuario = async (manager: EntityManager, userId: number): Promise<boolean> => {
    const cantidad = await manager.count(User, { where: { id: userId } });
    return cantidad > 0;
};

export const obtenerSala = (manager: EntityManager, salaId: string) =>
    manager.findOne(Sala, { where: { id: salaId } });

export const participoConfirmado = async (
    manager: EntityManager,
    salaId: string,
    userId: number,
): Promise<boolean> => {
    const cantidad = await manager.count(ParticipacionSala, {
        where: {
            sala: { id: salaId },
            usuario: { id: userId },
            estado: "CONFIRMADO",
        },
    });
    return cantidad > 0;
};

export const existeReview = async (
    manager: EntityManager,
    salaId: string,
    calificadorId: number,
    calificadoId: number,
): Promise<boolean> => {
    const cantidad = await manager.count(Review, {
        where: {
            sala: { id: salaId },
            calificador: { id: calificadorId },
            calificado: { id: calificadoId },
        },
    });
    return cantidad > 0;
};

export const guardarReview = (
    manager: EntityManager,
    datos: {
        salaId: string;
        calificadorId: number;
        calificadoId: number;
        estrellas: number;
        comentario?: string;
    },
) => {
    const nuevaReview = manager.create(Review, {
        estrellas: datos.estrellas,
        comentario: datos.comentario,
        sala: { id: datos.salaId },
        calificador: { id: datos.calificadorId },
        calificado: { id: datos.calificadoId },
    });
    return manager.save(nuevaReview);
};

export const calcularPromedio = async (manager: EntityManager, calificadoId: number) => {
    const resultado = await manager.createQueryBuilder(Review, "review")
        .select("AVG(review.estrellas)", "promedio")
        .addSelect("COUNT(review.id)", "totalResenas")
        .where("review.calificado_id = :calificadoId", { calificadoId })
        .getRawOne();

    const promedioSinRedondear = parseFloat(resultado.promedio) || 0;

    return {
        promedio: Math.round(promedioSinRedondear * 100) / 100,
        totalResenas: parseInt(resultado.totalResenas) || 0,
    };
};

export const actualizarReputacion = (manager: EntityManager, userId: number, promedio: number) =>
    manager.update(User, userId, { reputacion: promedio });

export const obtenerReviewsDeJugador = (manager: EntityManager, calificadoId: number) =>
    manager.find(Review, {
        where: { calificado: { id: calificadoId } },
        relations: { calificador: true },
        order: { creadoEn: "DESC" },
    });