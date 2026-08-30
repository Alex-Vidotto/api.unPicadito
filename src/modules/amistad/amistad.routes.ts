import { Router } from "express";
import { respondToFriendRequest } from "./amistad.controller";

const router = Router();
router.patch("/friend-requests/:id", respondToFriendRequest);

export default router;
