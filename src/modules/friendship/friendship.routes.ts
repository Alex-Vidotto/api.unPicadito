import { Router } from "express";
import { respondFriendship } from "./friendship.controller";
import { authenticateJWT } from "../../middleware/auth.middleware";
const router = Router();

// PATCH /friendships/:id/respond
router.patch("/:id/respond", authenticateJWT, respondFriendship);

//router.patch("/:id/respond", respondFriendship);

export default router;
