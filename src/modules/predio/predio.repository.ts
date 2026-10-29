import { AppDataSource } from "../../database/data-source";
import { Predio } from "./predio.entity";
import { Cancha } from "./cancha.entity";
import { BuscarPrediosCercanosQuery } from "./predio.schema";

export const basePredioRepo = AppDataSource.getRepository(Predio);
export const baseCanchaRepo = AppDataSource.getRepository(Cancha);

export const buscarPrediosCercanos = async (filtros: BuscarPrediosCercanosQuery) => {
    const { lat, lng, radioKm, busqueda } = filtros;

    const query = basePredioRepo.createQueryBuilder("predio")
        .where("predio.activo = :activo", { activo: true });

    if (busqueda) {
        query.andWhere(
            "(predio.nombre LIKE :busqueda OR predio.direccion LIKE :busqueda OR predio.localidad LIKE :busqueda)",
            { busqueda: `%${busqueda}%` }
        );
    }

    if (lat !== undefined && lng !== undefined) {
        const numLat = Number(lat);
        const numLng = Number(lng);
        const numRadioMetros = (Number(radioKm) || 30) * 1000;

        query.addSelect(
            `ROUND(ST_Distance_Sphere(predio.ubicacion, Point(${numLng}, ${numLat})) / 1000, 2)`,
            "distanciaKm"
        );
        if (!busqueda) {
            query.andWhere(
                `ST_Distance_Sphere(predio.ubicacion, Point(${numLng}, ${numLat})) <= ${numRadioMetros}`
            );
        }
        query.orderBy(`ST_Distance_Sphere(predio.ubicacion, Point(${numLng}, ${numLat}))`, "ASC");
    } else {
        query.addSelect("0", "distanciaKm");
        query.orderBy("predio.nombre", "ASC");
    }

    const { entities, raw } = await query.getRawAndEntities();

    const predios = entities.map((predio) => {
        const row = raw.find((r) => r.predio_id === predio.id);
        const distanciaKm = row && row.distanciaKm !== undefined ? Number(row.distanciaKm) : null;
        return {
            ...predio,
            distanciaKm,
        };
    });

    return predios;
};

export const obtenerCanchasPorPredio = async (predioId: number) => {
    return await baseCanchaRepo.find({
        where: { predio: { id: predioId }, activa: true },
        order: { nombre: "ASC" },
    });
};

export const obtenerCanchaConPredio = async (canchaId: number) => {
    return await baseCanchaRepo.findOne({
        where: { id: canchaId, activa: true },
        relations: { predio: true },
    });
};
