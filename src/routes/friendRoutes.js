import { Router } from "express";
import { sendFriendRequest } from "../controllers/friendController";
import { authenticateJWT } from "../middlewares/authMiddleware";
const router = Router();
router.post("/friends/request/:userId", authenticateJWT, sendFriendRequest);
export default router;
