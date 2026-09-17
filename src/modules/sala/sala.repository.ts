import { AppDataSource } from "../../database/data-source";
import { Sala } from "./sala.entity";
import { BuscarSalasQuery, CrearSalaBody } from "./sala.schema";

export const baseSalaRepo = AppDataSource.getRepository(Sala);

export const buscarSalasConFiltros = async (filtros: BuscarSalasQuery, amigosIds: number[] = []) => {
    const { 
        lat, lng, radioKm, fechaInicio, fechaFin, esPublica, 
        permiteSuplentes, estadoDisponibilidad 
        // TODO: Descomentar cuando el módulo de amigos esté listo
        // soloAmigos 
    } = filtros;

    // TODO: Descomentar cuando el módulo de amigos esté listo
    // if (soloAmigos && amigosIds.length === 0) return [];

    const query = baseSalaRepo.createQueryBuilder("sala")
        .leftJoinAndSelect("sala.creador", "creador")
        .leftJoin("sala.participantes", "participacion")
        .where("sala.estado = :estado", { estado: "ABIERTA" });

    if (esPublica !== undefined) query.andWhere("sala.esPublica = :esPublica", { esPublica });
    if (permiteSuplentes !== undefined) query.andWhere("sala.permiteSuplentes = :permiteSuplentes", { permiteSuplentes });
    if (fechaInicio) query.andWhere("sala.fechaHoraPartido >= :fechaInicio", { fechaInicio });
    if (fechaFin) query.andWhere("sala.fechaHoraPartido <= :fechaFin", { fechaFin });
    
    // TODO: Descomentar cuando el módulo de amigos esté listo
    // if (soloAmigos && amigosIds.length > 0) query.andWhere("sala.creador_id IN (:...amigosIds)", { amigosIds });

    // Corrección Espacial: Point recibe primero longitud (lng) y luego latitud (lat)
    if (lat !== undefined && lng !== undefined) {
        query.andWhere("ST_Distance_Sphere(sala.ubicacion, Point(:lng, :lat)) <= :radio", { 
            lat, lng, radio: radioKm * 1000 
        });
    }

    query.groupBy("sala.id").addGroupBy("creador.id");
    
    if (estadoDisponibilidad === 'DISPONIBLES') query.having("COUNT(participacion.id) < sala.cuposTotales");
    if (estadoDisponibilidad === 'LLENAS') query.having("COUNT(participacion.id) >= sala.cuposTotales");

    return await query.getMany();
};

// Crear sala
export const crearNuevaSala = async (data: CrearSalaBody, userId: number) => {
    // 1. Extraemos 'ubicacion' para tratarla por separado
    const { ubicacion, ...restoData } = data;
    const nuevaSala = baseSalaRepo.create({
        ...restoData,
        creador: { id: userId },
        // 2. La transformamos al formato de texto que MySQL entiende: "POINT(x y)"
        ubicacion: `POINT(${ubicacion.x} ${ubicacion.y})` as any
    });
    
    return await baseSalaRepo.save(nuevaSala);
};