import { escape } from "node:querystring";
import { AppDataSource } from "../../database/data-source";
import { Sala } from "./sala.entity";

export const baseSalaRepo = AppDataSource.getRepository(Sala);

export const buscarSalaCercanas = async (lat: number, lng: number, radioKm: number = 10) => {
    return await baseSalaRepo.createQueryBuilder("sala")
        .where("sala.estado = :estado", { estado: "ABIERTA" })
        .andWhere("sala.esPublica = :esPublica", { esPublica: true })
        .andWhere("ST_Distance_Sphere(sala.ubicacion, Point(:lat, :lng)) <= :radio", {
            lat,
            lng,
            radio: radioKm * 1000
        })
        .getMany();
};
