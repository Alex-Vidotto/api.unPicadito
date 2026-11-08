import { EntityManager } from "typeorm";
import { AppDataSource } from "../../database/data-source";
import { Review } from "./review.entity";
import { User } from "../user/user.entity";
import { Sala } from "../sala/sala.entity";
import { ParticipacionSala } from "../participacionSala/participacionSala.entity";

export const bloquearUsuario = (manager: EntityManager, userId: number) =>
    manager
        .createQueryBuilder(User, "usuario")
        .setLock("pessimistic_write")
        .where("usuario.id = :userId", { userId })
        .getOne();

export const existeUsuario = async (
    manager: EntityManager,
    userId: number,
): Promise<boolean> => {
    const cantidad = await manager.count(User, { where: { id: userId } });
    return cantidad > 0;
};

export const obtenerSala = (
    manager: EntityManager,
    salaId: string,
) => manager.findOne(Sala, { where: { id: salaId } });

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

export const tieneReviewReciente = async (
    manager: EntityManager,
    calificadorId: number,
    calificadoId: number,
    diasEspera: number,
): Promise<boolean> => {
    const recientes = await manager
        .createQueryBuilder(Review, "review")
        .where("review.calificador_id = :calificadorId", { calificadorId })
        .andWhere("review.calificado_id = :calificadoId", { calificadoId })
        .andWhere("review.creadoEn > DATE_SUB(NOW(6), INTERVAL :dias DAY)", {
            dias: diasEspera,
        })
        .getCount();
    return recientes > 0;
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
        comentario: datos.comentario || undefined,
        sala: { id: datos.salaId },
        calificador: { id: datos.calificadorId },
        calificado: { id: datos.calificadoId },
    });
    return manager.save(nuevaReview);
};

export const calcularPromedio = async (
    manager: EntityManager,
    calificadoId: number,
) => {
    const resultado = await manager
        .createQueryBuilder(Review, "review")
        .select("AVG(review.estrellas)", "promedio")
        .addSelect("COUNT(review.id)", "totalResenas")
        .where("review.calificado_id = :calificadoId", { calificadoId })
        .getRawOne();

    const promedioSinRedondear = parseFloat(resultado?.promedio) || 0;

    return {
        promedio: Math.round(promedioSinRedondear * 100) / 100,
        totalResenas: parseInt(resultado?.totalResenas) || 0,
    };
};

export const actualizarReputacion = (
    manager: EntityManager,
    userId: number,
    promedio: number,
) => manager.update(User, userId, { reputacion: promedio });

export const obtenerParticipacionesConfirmadasDeSala = (
    salaId: string,
    manager: EntityManager = AppDataSource.manager,
) =>
    manager.find(ParticipacionSala, {
        where: { sala: { id: salaId }, estado: "CONFIRMADO" },
        relations: { usuario: true },
    });

export const obtenerIdsCalificadosEnSala = async (
    salaId: string,
    userId: number,
    manager: EntityManager = AppDataSource.manager,
): Promise<Set<number>> => {
    const filas = await manager
        .createQueryBuilder(Review, "review")
        .select("review.calificado_id", "calificadoId")
        .where("review.calificador_id = :userId", { userId })
        .andWhere("review.sala_id = :salaId", { salaId })
        .getRawMany();

    return new Set<number>(filas.map((r) => Number(r.calificadoId)));
};

export const obtenerBloqueadosRecientes = async (
    userId: number,
    diasEspera: number,
    manager: EntityManager = AppDataSource.manager,
): Promise<Map<number, number>> => {
    const filas = await manager
        .createQueryBuilder(Review, "review")
        .select("review.calificado_id", "calificadoId")
        .addSelect(
            "CEIL(:dias - TIMESTAMPDIFF(SECOND, MAX(review.creadoEn), NOW(6)) / 86400)",
            "diasRestantes",
        )
        .where("review.calificador_id = :userId", { userId })
        .andWhere("review.creadoEn > DATE_SUB(NOW(6), INTERVAL :dias DAY)")
        .groupBy("review.calificado_id")
        .setParameters({ userId, dias: diasEspera })
        .getRawMany();

    return new Map<number, number>(
        filas.map((r) => [Number(r.calificadoId), Math.max(1, Number(r.diasRestantes))]),
    );
};