import { AppDataSource } from "../../database/data-source";
import { Sala } from "./sala.entity";
import { ParticipacionSala } from "../participacionSala/participacionSala.entity";
import { BuscarSalasQuery, CrearSalaBody } from "./sala.schema";
import { EstadoParticipacion, RolEnSala } from "../../constants/type";

export const baseSalaRepo = AppDataSource.getRepository(Sala);
export const baseParticipacionSalaRepo = AppDataSource.getRepository(ParticipacionSala);

const escaparLike = (valor: string) => valor.replace(/[\\%_]/g, "\\$&");

export const buscarSalasConFiltros = async (
    filtros: BuscarSalasQuery,
    amigosIds: number[] = [],
    userId?: number
) => {
    const {
        lat, lng, radioKm, fechaInicio, fechaFin, esPublica,
        permiteSuplentes, estadoDisponibilidad, nombre, nombreCancha,
        limite, pagina,
    } = filtros;

    const query = baseSalaRepo.createQueryBuilder("sala")
        .leftJoinAndSelect("sala.creador", "creador")
        .leftJoin("sala.participantes", "participacion", "participacion.estado = :confirmado", { confirmado: "CONFIRMADO" })
        .where("sala.estado = :estado", { estado: "ABIERTA" });

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
        query.addSelect("COUNT(DISTINCT mi_part.id)", "unidoPorUsuarioActual");
    } else {
        query.addSelect("0", "unidoPorUsuarioActual");
    }

    query.addSelect("COUNT(DISTINCT participacion.id)", "cuposOcupados");

    query.groupBy("sala.id").addGroupBy("creador.id");

    if (estadoDisponibilidad === "DISPONIBLES") {
        query.having("COUNT(DISTINCT participacion.id) < sala.cuposTotales");
    } else if (estadoDisponibilidad === "LLENAS") {
        query.having("COUNT(DISTINCT participacion.id) >= sala.cuposTotales");
    }

    query.orderBy("sala.fechaHoraPartido", "ASC")
        .addOrderBy("sala.id", "ASC")
        .skip((pagina - 1) * limite)
        .take(limite);

    const { entities, raw } = await query.getRawAndEntities();

    const metricasPorSalaId = new Map<string, { cuposOcupados: number; unidoPorUsuarioActual: number }>();

    for (const row of raw) {
        const id = row.sala_id;
        if (!id || metricasPorSalaId.has(id)) continue;

        if (!("cuposOcupados" in row)) {
            throw new Error("Alias SQL 'cuposOcupados' no devuelto por getRawAndEntities()");
        }

        metricasPorSalaId.set(id, {
            cuposOcupados: Number(row.cuposOcupados),
            unidoPorUsuarioActual: Number(row.unidoPorUsuarioActual),
        });
    }

    return entities.map((sala) => {
        const metricas = metricasPorSalaId.get(sala.id);
        if (!metricas) {
            throw new Error(`Inconsistencia: no se encontraron métricas agregadas para la sala ${sala.id}`);
        }
        return Object.assign(sala, metricas);
    });
};

export const crearNuevaSala = ({ ubicacion, ...restoData }: CrearSalaBody, userId: number) =>
    baseSalaRepo.save(baseSalaRepo.create({
        ...restoData,
        creador: { id: userId },
        ubicacion: `POINT(${ubicacion.x} ${ubicacion.y})` as any,
    }));

export const obtenerSalaConCreador = (salaId: string) =>
    baseSalaRepo.findOne({ where: { id: salaId }, relations: { creador: true } });

export const obtenerSalaConParticipantes = (salaId: string) =>
    baseSalaRepo.findOne({
        where: { id: salaId },
        relations: { creador: true, participantes: { usuario: true } },
    });

export const crearParticipacionEnSala = (
    salaId: string,
    userId: number,
    data: {
        estado: "CONFIRMADO" | "PENDIENTE";
        rol: "ORGANIZADOR" | "TITULAR" | "SUPLENTE" | "SOLICITANTE";
        origenIngreso: "ENLACE_INVITACION" | "SOLICITUD_DIRECTA";
    }
) =>
    baseParticipacionSalaRepo.save(baseParticipacionSalaRepo.create({
        sala: { id: salaId },
        usuario: { id: userId },
        ...data,
    }));

export const cambiarEstadoSalaEnBD = (salaId: string, motivoCancelacion: string) =>
    baseSalaRepo.update(salaId, { estado: "CANCELADA", motivoCancelacion });

export const eliminarParticipacionDeSala = (participacionId: string) =>
    baseParticipacionSalaRepo.delete(participacionId);

export const contarParticipantesConfirmados = (salaId: string) =>
    baseParticipacionSalaRepo.count({
        where: { sala: { id: salaId }, estado: "CONFIRMADO" },
    });

export const actualizarEstadoSalaEnBD = (
    salaId: string,
    estado: "ABIERTA" | "COMPLETA" | "FINALIZADA" | "CANCELADA"
) => baseSalaRepo.update(salaId, { estado });

export const actualizarSalaEnBD = async (salaId: string, datos: Partial<Sala>) => {
    const resultado = await baseSalaRepo.update(salaId, datos);

    if (!resultado.affected) return null;

    return baseSalaRepo.findOne({ where: { id: salaId } });
};

export const esOrganizadorDeSala = async (salaId: string, userId: number): Promise<boolean> => {
    const count = await baseParticipacionSalaRepo.count({
        where: {
            sala: { id: salaId },
            usuario: { id: userId },
            rol: "ORGANIZADOR",
            estado: "CONFIRMADO"
        },
    });
    return count > 0;
};

export const obtenerOrganizadorDeSala = (salaId: string) =>
    baseParticipacionSalaRepo.findOne({
        where: {
            sala: { id: salaId },
            rol: "ORGANIZADOR",
            estado: "CONFIRMADO"
        },
        relations: { usuario: true },
    });

export const obtenerParticipacionConfirmada = (salaId: string, userId: number) =>
    baseParticipacionSalaRepo.findOne({
        where: {
            sala: { id: salaId },
            usuario: { id: userId },
            estado: "CONFIRMADO",
        },
    });

export const actualizarRolParticipacion = (participacionId: string, rol: RolEnSala) =>
    baseParticipacionSalaRepo.update(participacionId, { rol });

export const obtenerParticipacionPorId = (participacionId: string) =>
    baseParticipacionSalaRepo.findOne({
        where: { id: participacionId },
        relations: { usuario: true, sala: true },
    });

export const actualizarEstadoYRolParticipacion = (
    participacionId: string,
    rol: RolEnSala,
    estado: EstadoParticipacion) =>
    baseParticipacionSalaRepo.update(participacionId, { rol, estado });

export const finalizarSalasVencidasEnBD = async (limite: Date, salaId?: string): Promise<number> => {
    const query = baseSalaRepo
        .createQueryBuilder()
        .update(Sala)
        .set({ estado: "FINALIZADA" })
        .where("estado IN (:...estados)", { estados: ["ABIERTA", "COMPLETA"] })
        .andWhere("fechaHoraPartido <= :limite", { limite });

    if (salaId) query.andWhere("id = :salaId", { salaId });

    const resultado = await query.execute();
    return resultado.affected ?? 0;
};