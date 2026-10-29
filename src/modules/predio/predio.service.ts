import { buscarPrediosCercanos, obtenerCanchasPorPredio, obtenerCanchaConPredio } from "./predio.repository";
import { BuscarPrediosCercanosQuery } from "./predio.schema";

const errorHttp = (status: number, mensaje: string) => Object.assign(new Error(mensaje), { status });

export const buscarPrediosService = (filtros: BuscarPrediosCercanosQuery) => {
    return buscarPrediosCercanos(filtros);
};

export const obtenerCanchasPorPredioService = async (predioId: number) => {
    return await obtenerCanchasPorPredio(predioId);
};

export const obtenerCanchaConPredioService = async (canchaId: number) => {
    const cancha = await obtenerCanchaConPredio(canchaId);
    if (!cancha) throw errorHttp(404, "Cancha no encontrada o inactiva");
    return cancha;
};
