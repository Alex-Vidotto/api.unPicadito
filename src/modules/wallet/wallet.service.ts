import { EntityManager } from "typeorm";
import { AppDataSource } from "../../database/data-source";
import { User } from "../user/user.entity";
import { WalletMovement, MovementStatus } from "./wallet.entity";

export class WalletService {
  /**
   * Intenta aplicar el saldo a favor dentro de una transacción activa.
   */
  static async aplicarDescuento(
    manager: EntityManager,
    userId: number,
    matchId: string,
    costoTotal: number,
    idempotencyKey: string,
  ) {
    // 1. Bloqueo pesimista para evitar carreras de saldo
    const user = await manager.findOne(User, {
      where: { id: userId },
      lock: { mode: "pessimistic_write" },
    });

    if (!user) throw new Error("Usuario no encontrado");

    const saldoDisponible = Number(user.saldoCredito ?? 0);
    const descuentoAplicado = Math.min(saldoDisponible, costoTotal);
    const remanenteAPagar = Math.max(0, costoTotal - descuentoAplicado);

    if (descuentoAplicado > 0) {
      user.saldoCredito = Number(
        (saldoDisponible - descuentoAplicado).toFixed(2),
      );
      await manager.save(user);

      const status =
        remanenteAPagar === 0
          ? MovementStatus.COMPLETED
          : MovementStatus.PENDING;

      const movement = manager.create(WalletMovement, {
        userId: user.id,
        matchId,
        idempotencyKey,
        montoReservado: descuentoAplicado,
        status,
      });

      await manager.save(movement);
    }

    return { descuentoAplicado, remanenteAPagar };
  }

  /**
   * Webhook simulado para Mercado Pago.
   */
  static async procesarWebhookMock(
    idempotencyKey: string,
    status: "approved" | "rejected",
  ) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Endpoint no disponible en producción");
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const movement = await queryRunner.manager.findOne(WalletMovement, {
        where: { idempotencyKey },
      });

      if (!movement || movement.status !== MovementStatus.PENDING) {
        await queryRunner.rollbackTransaction();
        return {
          processed: false,
          reason: "Movimiento no pendiente o inexistente",
        };
      }

      if (status === "approved") {
        movement.status = MovementStatus.COMPLETED;
        await queryRunner.manager.save(movement);

        await queryRunner.commitTransaction();
        return { processed: true, result: "INSCRIPTION_CONFIRMED" };
      } else {
        movement.status = MovementStatus.CANCELLED;
        await queryRunner.manager.save(movement);

        const user = await queryRunner.manager.findOne(User, {
          where: { id: movement.userId },
          lock: { mode: "pessimistic_write" },
        });

        if (user) {
          user.saldoCredito = Number(
            (
              Number(user.saldoCredito) + Number(movement.montoReservado)
            ).toFixed(2),
          );
          await queryRunner.manager.save(user);
        }

        await queryRunner.commitTransaction();
        return { processed: true, result: "CREDIT_REFUNDED" };
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
