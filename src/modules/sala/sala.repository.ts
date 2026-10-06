import { AppDataSource } from "../../database/data-source";
import { Sala } from "./sala.entity";
import { ParticipacionSala } from "../participacionSala/participacionSala.entity";
import { BuscarSalasQuery, CrearSalaBody } from "./sala.schema";
import { RolEnSala } from "../../constants/type";

export const baseSalaRepo = AppDataSource.getRepository(Sala);
export const baseParticipacionSalaRepo = AppDataSource.getRepository(ParticipacionSala);

// Escapa los comodines de LIKE (% y _) para que el usuario no pueda usarlos como wildcard
const escaparLike = (valor: string) => valor.replace(/[\\%_]/g, "\\$&");

export const buscarSalasConFiltros = (
    filtros: BuscarSalasQuery,
    amigosIds: number[] = []
) => {
    const {
        lat, lng, radioKm, fechaInicio, fechaFin, esPublica,
        permiteSuplentes, estadoDisponibilidad, nombre, nombreCancha,
        // TODO: Descomentar cuando el módulo de amigos esté listo
        // soloAmigos
    } = filtros;

    // TODO: Descomentar cuando el módulo de amigos esté listo
    // if (soloAmigos && amigosIds.length === 0) return Promise.resolve([]);

    const query = baseSalaRepo.createQueryBuilder("sala")
        .leftJoinAndSelect("sala.creador", "creador")
        // Solo las participaciones CONFIRMADAS ocupan cupo (PENDIENTE/SOLICITANTE no cuentan)
        .leftJoin("sala.participantes", "participacion", "participacion.estado = :confirmado", { confirmado: "CONFIRMADO" })
        .where("sala.estado = :estado", { estado: "ABIERTA" });

    if (nombre) query.andWhere("sala.nombre LIKE :nombre", { nombre: `%${escaparLike(nombre)}%` });
    if (nombreCancha) query.andWhere("sala.nombreCancha LIKE :nombreCancha", { nombreCancha: `%${escaparLike(nombreCancha)}%` });
    if (esPublica !== undefined) query.andWhere("sala.esPublica = :esPublica", { esPublica });
    if (permiteSuplentes !== undefined) query.andWhere("sala.permiteSuplentes = :permiteSuplentes", { permiteSuplentes });
    if (fechaInicio) query.andWhere("sala.fechaHoraPartido >= :fechaInicio", { fechaInicio });
    if (fechaFin) query.andWhere("sala.fechaHoraPartido <= :fechaFin", { fechaFin });

    // TODO: Descomentar cuando el módulo de amigos esté listo
    // if (soloAmigos && amigosIds.length > 0) query.andWhere("sala.creador_id IN (:...amigosIds)", { amigosIds });

    // Point recibe primero longitud (lng) y luego latitud (lat)
    if (lat !== undefined && lng !== undefined && radioKm !== undefined) {
        query.andWhere("ST_Distance_Sphere(sala.ubicacion, Point(:lng, :lat)) <= :radio", {
            lat, lng, radio: radioKm * 1000,
        });
    }

    query.groupBy("sala.id").addGroupBy("creador.id");

    if (estadoDisponibilidad === "DISPONIBLES") query.having("COUNT(participacion.id) < sala.cuposTotales");
    else if (estadoDisponibilidad === "LLENAS") query.having("COUNT(participacion.id) >= sala.cuposTotales");

    return query.getMany();
};

export const crearNuevaSala = ({ ubicacion, ...restoData }: CrearSalaBody, userId: number) =>
    baseSalaRepo.save(baseSalaRepo.create({
        ...restoData,
        creador: { id: userId },
        // Formato WKT que entiende MySQL: "POINT(x y)"
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
