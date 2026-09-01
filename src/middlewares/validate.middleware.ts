import { Request, Response, NextFunction } from "express";
import { AnySchema, ValidationError } from "yup";

export const validateSchema = (schema: AnySchema) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Validamos y sanitizamos (ej: hacer trim a los strings)
            // Sobrescribimos req.body con los datos ya limpios
            req.body = await schema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true
            });
            next();
        } catch (error: any) {
            if (error instanceof ValidationError) {
                // Extraemos solo los mensajes de error de Yup
                const errors = error.inner.map((err) => ({
                    field: err.path,
                    message: err.message
                }));
                res.status(400).json({ message: "Validation error", errors });
                return;
            }
            res.status(500).json({ message: "Internal validation error" });
        }
    };
};