import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validateMiddleware = (
    schema: ZodSchema,
    target: "body" | "query" | "params" = "body",
) => {
    return async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            // Validamos con Zod y sobreescribimos los datos
            const parsed = await schema.parseAsync(req[target]);
            // req.query es readonly en Express v5, usamos Object.assign para mutarlo
            if (target === "query") {
                Object.assign(req.query, parsed);
            } else {
                req[target] = parsed;
            }
            next();
        } catch (error: any) {
            console.error(
                "🔴 Error capturado en validación:",
                error?.name,
                error?.message,
            );
            if (error instanceof ZodError || error?.name === "ZodError") {
                res.status(400).json({
                    message: "Error de validación",
                    errors: error.issues.map((err: any) => ({
                        field: err.path.join("."),
                        message: err.message,
                    })),
                });
                return;
            }
            res.status(500).json({ message: "Error interno de validación" });
        }
    };
};

export const catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
