import { AppDataSource } from "../../database/data-source";
import type { EntityManager } from "typeorm";
import { Sala } from "./sala.entity";
import { ParticipacionSala } from "../participacionSala/participacionSala.entity";
import { BuscarSalasQuery } from "./sala.schema";
import { EstadoParticipacion, RolEnSala, EstadoSala, OrigenIngreso, ESTADO_PARTICIPACION, ESTADO_SALA, ROL_EN_SALA } from "../../constants/type";

export const baseSalaRepo = AppDataSource.getRepository(Sala);
export const baseParticipacionSalaRepo = AppDataSource.getRepository(ParticipacionSala);

const escaparLike = (valor: string) => valor.replace(/[\\%_]/g, "\\$&");

export const ejecutarTransaccion = async <T>(cb: (manager: EntityManager) => Promise<T>): Promise<T> => {
    return await AppDataSource.transaction(cb);
};

export const buscarSalasConFiltros = async (
    filtros: BuscarSalasQuery,
    amigosIds: number[] = [],
    userId?: number
) => {
    const {
        lat, lng, radioKm, fechaInicio, fechaFin, esPublica,
        permiteSuplentes, estadoDisponibilidad, nombre, nombreCancha,
        limite, pagina, misSalas,
    } = filtros;

    const query = baseSalaRepo.createQueryBuilder("sala")
        .leftJoinAndSelect("sala.creador", "creador")
        .leftJoinAndSelect("sala.cancha", "cancha")
        .leftJoinAndSelect("cancha.predio", "predio")
        .leftJoin("sala.participantes", "participacion", "participacion.estado = :confirmado", { confirmado: ESTADO_PARTICIPACION.CONFIRMADO })
        .where("sala.estado IN (:...estados)", { estados: [ESTADO_SALA.ABIERTA, ESTADO_SALA.COMPLETA] });

    if (nombre) query.andWhere("sala.nombre LIKE :nombre", { nombre: `%${escaparLike(nombre)}%` });
    if (nombreCancha) query.andWhere("sala.nombreCancha LIKE :nombreCancha", { nombreCancha: `%${escaparLike(nombreCancha)}%` });
    if (esPublica !== undefined) query.andWhere("sala.esPublica = :esPublica", { esPublica });
    if (permiteSuplentes !== undefined) query.andWhere("sala.permiteSuplentes = :permiteSuplentes", { permiteSuplentes });
    const ahora = new Date();
    const fechaMinima = fechaInicio && new Date(fechaInicio) > ahora ? fechaInicio : ahora;
    query.andWhere("sala.fechaHoraPartido >= :fechaMinima", { fechaMinima });

    if (fechaFin) query.andWhere("sala.fechaHoraPartido <= :fechaFin", { fechaFin });

    if (lat !== undefined && lng !== undefined && radioKm !== undefined) {
        query.andWhere("ST_Distance_Sphere(sala.ubicacion, Point(:lng, :lat)) <= :radio", {
            lat, lng, radio: radioKm * 1000,
        });
    }

    if (userId !== undefined) {
        query.leftJoin("sala.participantes", "mi_part", "mi_part.usuario_id = :userId", { userId });
        query.addSelect(
            `COUNT(DISTINCT CASE WHEN mi_part.estado = '${ESTADO_PARTICIPACION.CONFIRMADO}' THEN mi_part.id END)`,
            "unidoPorUsuarioActual"
        );
        query.addSelect(
            `COUNT(DISTINCT CASE WHEN mi_part.estado = '${ESTADO_PARTICIPACION.PENDIENTE}' THEN mi_part.id END)`,
            "solicitudPendiente"
        );

        if (misSalas) {
            query.andWhere("(sala.creador_id = :userId OR mi_part.id IS NOT NULL)", { userId });
        }
    } else {
        query.addSelect("0", "unidoPorUsuarioActual");
        query.addSelect("0", "solicitudPendiente");
    }

    query.addSelect("COUNT(DISTINCT participacion.id)", "cuposOcupados");
    query.groupBy("sala.id").addGroupBy("creador.id").addGroupBy("cancha.id").addGroupBy("predio.id");

    if (estadoDisponibilidad === "DISPONIBLES") {
        query.having("COUNT(DISTINCT participacion.id) < sala.cuposTotales");
    } else if (estadoDisponibilidad === "LLENAS") {
        query.having("COUNT(DISTINCT participacion.id) >= sala.cuposTotales");
    }

    const totalRaw = await baseSalaRepo.manager.createQueryBuilder()
        .select("COUNT(*)", "total")
        .from("(" + query.getQuery() + ")", "subq")
        .setParameters(query.getParameters())
        .getRawOne();
    const total = Number(totalRaw?.total || 0);

    query.orderBy("sala.fechaHoraPartido", "ASC")
        .addOrderBy("sala.id", "ASC")
        .skip((pagina - 1) * limite)
        .take(limite);

    const { entities, raw } = await query.getRawAndEntities();
    const metricasPorSalaId = new Map<string, {
        cuposOcupados: number;
        unidoPorUsuarioActual: number;
        solicitudPendiente: number;
    }>();

    for (const row of raw) {
        const id = row.sala_id;
        if (!id || metricasPorSalaId.has(id)) continue;

        if (!("cuposOcupados" in row)) {
            throw new Error("Alias SQL 'cuposOcupados' no devuelto por getRawAndEntities()");
        }

        metricasPorSalaId.set(id, {
            cuposOcupados: Number(row.cuposOcupados),
            unidoPorUsuarioActual: Number(row.unidoPorUsuarioActual) > 0 ? 1 : 0,
            solicitudPendiente: Number(row.solicitudPendiente) > 0 ? 1 : 0,
        });
    }

    const salas = entities.map((sala) => {
        const metricas = metricasPorSalaId.get(sala.id);
        if (!metricas) {
            throw new Error(`Inconsistencia: no se encontraron métricas agregadas para la sala ${sala.id}`);
        }
        return Object.assign(sala, metricas);
    });

    return {
        salas,
        paginacion: {
            total,
            pagina,
            limite,
            totalPaginas: Math.ceil(total / limite) || 1,
        },
    };
};

export const crearNuevaSala = async (data: any, userId: number, manager?: EntityManager) => {
    const { ubicacion, canchaId, ...restoData } = data;
    const repositorio = manager ? manager.getRepository(Sala) : baseSalaRepo;
    const sala = repositorio.create({
        ...restoData,
        cancha: { id: canchaId },
        creador: { id: userId },
        ubicacion: `POINT(${ubicacion.x} ${ubicacion.y})` as any,
    } as Partial<Sala>);
    return await repositorio.save(sala);
};

export const obtenerSalaConParticipantes = async (salaId: string) => {
    return await baseSalaRepo.findOne({
        where: { id: salaId },
        relations: { creador: true, cancha: { predio: true }, participantes: { usuario: true } },
    });
};

export const obtenerSalaConBloqueo = async (
    salaId: string,
    manager: EntityManager,
    conParticipantes: boolean = false
) => {
    const qb = manager.createQueryBuilder(Sala, "sala");
    if (conParticipantes) {
        qb.leftJoinAndSelect("sala.participantes", "participacion")
          .leftJoinAndSelect("participacion.usuario", "usuario");
    }
    return await qb.setLock("pessimistic_write").where("sala.id = :salaId", { salaId }).getOne();
};

export const obtenerSalaSimple = async (salaId: string, manager?: EntityManager) => {
    const repositorio = manager ? manager.getRepository(Sala) : baseSalaRepo;
    return await repositorio.findOne({ where: { id: salaId } });
};

export const actualizarSala = async (salaId: string, datos: Partial<Sala>, manager?: EntityManager) => {
    const repositorio = manager ? manager.getRepository(Sala) : baseSalaRepo;
    return await repositorio.update(salaId, datos);
};

export const crearParticipacionEnSala = async (
    salaId: string,
    userId: number,
    data: {
        estado: EstadoParticipacion;
        rol: RolEnSala;
        origenIngreso: OrigenIngreso;
    },
    manager?: EntityManager
) => {
    const repositorio = manager ? manager.getRepository(ParticipacionSala) : baseParticipacionSalaRepo;
    const participacion = repositorio.create({
        sala: { id: salaId },
        usuario: { id: userId },
        ...data,
    });
    return await repositorio.save(participacion);
};

export const guardarNuevaParticipacion = async (datos: any, manager?: EntityManager) => {
    const repositorio = manager ? manager.getRepository(ParticipacionSala) : baseParticipacionSalaRepo;
    const participacion = repositorio.create(datos);
    return await repositorio.save(participacion);
};

export const contarParticipantesConfirmados = async (salaId: string, manager?: EntityManager) => {
    const repositorio = manager ? manager.getRepository(ParticipacionSala) : baseParticipacionSalaRepo;
    return await repositorio.count({
        where: { sala: { id: salaId }, estado: ESTADO_PARTICIPACION.CONFIRMADO },
    });
};

export const actualizarEstadoSalaEnBD = async (salaId: string, estado: EstadoSala) => {
    return await baseSalaRepo.update(salaId, { estado });
};

export const esOrganizadorDeSala = async (salaId: string, userId: number, manager?: EntityManager) => {
    const repositorio = manager ? manager.getRepository(ParticipacionSala) : baseParticipacionSalaRepo;
    const count = await repositorio.count({
        where: {
            sala: { id: salaId },
            usuario: { id: userId },
            rol: ROL_EN_SALA.ORGANIZADOR,
            estado: ESTADO_PARTICIPACION.CONFIRMADO,
        },
    });
    return count > 0;
};

export const verificarEsOrganizador = esOrganizadorDeSala;

export const obtenerParticipacionPorId = async (participacionId: string) => {
    return await baseParticipacionSalaRepo.findOne({
        where: { id: participacionId },
        relations: { usuario: true, sala: true },
    });
};

export const obtenerParticipacion = async (criterios: any, manager?: EntityManager, relations?: any) => {
    const repositorio = manager ? manager.getRepository(ParticipacionSala) : baseParticipacionSalaRepo;
    return await repositorio.findOne({
        where: criterios,
        relations,
    });
};

export const actualizarEstadoYRolParticipacion = async (
    participacionId: string,
    rol: RolEnSala,
    estado: EstadoParticipacion,
    manager?: EntityManager
) => {
    const repositorio = manager ? manager.getRepository(ParticipacionSala) : baseParticipacionSalaRepo;
    return await repositorio.update(participacionId, { rol, estado });
};

export const actualizarParticipacion = async (
    participacionId: string,
    datos: any,
    manager?: EntityManager
) => {
    const repositorio = manager ? manager.getRepository(ParticipacionSala) : baseParticipacionSalaRepo;
    return await repositorio.update(participacionId, datos);
};

export const eliminarParticipacion = async (participacionId: string, manager?: EntityManager) => {
    const repositorio = manager ? manager.getRepository(ParticipacionSala) : baseParticipacionSalaRepo;
    return await repositorio.delete(participacionId);
};

export const finalizarSalasVencidasEnBD = async (limite: Date, salaId?: string): Promise<number> => {
    const query = baseSalaRepo
        .createQueryBuilder()
        .update(Sala)
        .set({ estado: ESTADO_SALA.FINALIZADA })
        .where("estado IN (:...estados)", { estados: [ESTADO_SALA.ABIERTA, ESTADO_SALA.COMPLETA] })
        .andWhere("fechaHoraPartido <= :limite", { limite });

    if (salaId) query.andWhere("id = :salaId", { salaId });

    const resultado = await query.execute();
    return resultado.affected ?? 0;
};
