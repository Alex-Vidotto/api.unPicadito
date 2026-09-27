import { Router } from "express";
import { leaveMatchController } from "./matches.controller.js";
import { authenticateJWT } from "../../middlewares/auth.middleware.js";
import { validateMiddleware } from "../../middlewares/validate.middleware.js";
import { leaveMatchSchema } from "./matches.schema.js";

const router = Router();

/**
 * @route   DELETE /api/matches/:matchId/leave
 * @desc    Abandonar un partido/match
 * @access  Private
 */
router.delete(
  "/:matchId/leave",
  authenticateJWT,
  validateMiddleware(leaveMatchSchema, "params"),
  leaveMatchController,
);

export default router;
