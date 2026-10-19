import { Router } from "express";
import { WalletController } from "./wallet.controller";
import { authenticateJWT } from "../../middlewares/auth.middleware";

const router = Router();

// Endpoint para consultar el saldo
router.get("/balance", authenticateJWT, WalletController.getBalance);

// Endpoint simulado de test / webhook
router.post("/webhook-mock", WalletController.handleWebhookMock);

export const walletRoutes = router;
