import { Request, Response } from "express";
import { WalletService } from "./wallet.service";
import { webhookMockSchema } from "./wallet.dto";

export class WalletController {
  static async getBalance(req: Request, res: Response) {
    try {
      // Asume que el middleware de autenticación inyecta req.user
      const user = (req as any).user;
      return res.json({ saldoCredito: user?.saldoCredito || 0 });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async handleWebhookMock(req: Request, res: Response) {
    try {
      const validatedData = webhookMockSchema.parse(req.body);
      const result = await WalletService.procesarWebhookMock(
        validatedData.idempotencyKey,
        validatedData.status,
      );
      return res.json(result);
    } catch (error: any) {
      return res
        .status(400)
        .json({ error: error.message || "Error en Webhook Mock" });
    }
  }
}
