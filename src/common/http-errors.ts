/**
 * Errores HTTP de la aplicación.
 * Ubicación sugerida: src/common/http-errors.ts (los imports de sala.service.ts y
 * sala.controller.ts asumen esa ruta; ajustalos si lo dejás en otro lado).
 */
export class HttpError extends Error {
    constructor(public readonly status: number, message: string) {
        super(message);
        this.name = new.target.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class BadRequestError extends HttpError {
    constructor(message = "Solicitud inválida") {
        super(400, message);
    }
}

export class UnauthorizedError extends HttpError {
    constructor(message = "No autorizado") {
        super(401, message);
    }
}

export class ForbiddenError extends HttpError {
    constructor(message = "No tenés permiso para realizar esta acción") {
        super(403, message);
    }
}

export class NotFoundError extends HttpError {
    constructor(message = "Recurso no encontrado") {
        super(404, message);
    }
}

export class ConflictError extends HttpError {
    constructor(message = "La operación entra en conflicto con el estado actual") {
        super(409, message);
    }
}