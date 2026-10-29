import { Router } from "express";
import * as friendshipController from "./friendship.controller";
import { validateMiddleware } from "../../middlewares/validate.middleware";
import { sendFriendshipSchema, respondFriendshipBodySchema, friendshipIdParamSchema } from "./friendship.schema";

const router = Router();

router.post("/", validateMiddleware(sendFriendshipSchema, "body"), friendshipController.sendFriendshipRequest);
router.patch("/:id/respond", validateMiddleware(friendshipIdParamSchema, "params"), validateMiddleware(respondFriendshipBodySchema, "body"), friendshipController.respondFriendship);

export default router;
