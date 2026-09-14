import { Router } from "express";
import {
  sendFriendshipRequest,
  respondFriendship,
} from "./friendship.controller";
import { authenticateJWT } from "../../middleware/auth.middleware";

const router = Router();

// POST /friendships (UP-045)
router.post("/", authenticateJWT, sendFriendshipRequest);

// PATCH /friendships/:id/respond (UP-046)
router.patch("/:id/respond", authenticateJWT, respondFriendship);

export default router;
