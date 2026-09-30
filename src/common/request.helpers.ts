import { Request } from "express";
import { BadRequestError, UnauthorizedError } from "./http-errors";

/** Devuelve el id del usuario autenticado o lanza 401. */
export const obtenerUserId = (req: Request): number => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError();
    return userId;
};

/** Devuelve un parámetro de ruta como string (por defecto "id") o lanza 400. */
export const obtenerIdParam = (req: Request, nombre = "id"): string => {
    const valor = req.params[nombre];
    const id = Array.isArray(valor) ? valor[0] : valor;
    if (typeof id !== "string" || !id) throw new BadRequestError(`El parámetro "${nombre}" no es válido`);
    return id;
};