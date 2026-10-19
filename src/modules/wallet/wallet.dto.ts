import { z } from "zod";

export const checkoutSchema = z.object({
  matchId: z
    .string()
    .uuid({ message: "El ID de la sala debe ser un UUID válido" }),
  idempotencyKey: z
    .string()
    .min(10, { message: "Clave de idempotencia requerida" }),
});

export const webhookMockSchema = z.object({
  idempotencyKey: z.string().min(10),
  status: z.enum(["approved", "rejected"]),
});

export type CheckoutDto = z.infer<typeof checkoutSchema>;
export type WebhookMockDto = z.infer<typeof webhookMockSchema>;
