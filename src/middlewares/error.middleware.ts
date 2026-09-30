import { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError } from "zod";
import { QueryFailedError } from "typeorm";
import { HttpError } from "../common/http-errors";

/**
 * Envuelve un controller async y reenvía cualquier error al errorHandler global.
 * Funciona igual en Express 4 y 5 (en Express 5 sería opcional, pero no molesta).
 */
export const asyncHandler =
    (handler: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler =>
    (req, res, next) => {
        handler(req, res, next).catch(next);
    };

/** Para rutas que no existen. Se registra después de todas las rutas. */
export const notFoundHandler: RequestHandler = (req, res) => {
    res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};

/** Manejo de errores global. Se registra al final, después de notFoundHandler. */
export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
    // Si ya se empezó a responder, Express debe cerrar la conexión él mismo
    if (res.headersSent) return next(error);

    if (error instanceof ZodError) {
        res.status(400).json({ success: false, message: "Datos inválidos", errors: error.issues });
        return;
    }

    if (error instanceof HttpError) {
        res.status(error.status).json({ success: false, message: error.message });
        return;
    }

    // JSON mal formado en el body (lo lanza express.json())
    if (error instanceof SyntaxError && "body" in error) {
        res.status(400).json({ success: false, message: "El cuerpo de la solicitud no es un JSON válido" });
        return;
    }

    // Violación de unique en MySQL (email repetido, amistad duplicada, etc.)
    if (error instanceof QueryFailedError && (error as any).driverError?.code === "ER_DUP_ENTRY") {
        res.status(409).json({ success: false, message: "Ya existe un registro con esos datos" });
        return;
    }

    // Error inesperado: se loguea y no se expone el detalle al cliente
    console.error(error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
};