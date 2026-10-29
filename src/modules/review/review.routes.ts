import { Router } from "express";
import * as reviewController from "./review.controller";
import { authenticateJWT } from "../../middlewares/auth.middleware";
import { validateMiddleware } from "../../middlewares/validate.middleware";
import { crearReviewSchema, rankingParamsSchema } from "./review.schema";

const router = Router();

router.post("/", authenticateJWT, validateMiddleware(crearReviewSchema, "body"), reviewController.crear);
router.get("/ranking/:id", validateMiddleware(rankingParamsSchema, "params"), reviewController.obtenerRanking);

export default router;
