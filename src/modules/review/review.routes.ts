import { Router } from "express";
import * as reviewController from "./review.controller";
import { authenticateJWT } from "../../middlewares/auth.middleware";
import { validateMiddleware } from "../../middlewares/validate.middleware";
import { crearReviewBodySchema, usuarioIdParamsSchema } from "./review.schema";

const router = Router();

router.post(
    "/",
    authenticateJWT,
    validateMiddleware(crearReviewBodySchema, "body"),
    reviewController.crear,
);

router.get(
    "/ranking/:id",
    validateMiddleware(usuarioIdParamsSchema, "params"),
    reviewController.obtenerRanking,
);

export default router;
