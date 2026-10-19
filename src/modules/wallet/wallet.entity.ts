import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from "typeorm";
import { User } from "../user/user.entity";

export enum MovementStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export const ColumnNumericTransformer = {
  to: (data: number): number => data,
  from: (data: string): number => parseFloat(data),
};

@Entity("wallet_movements")
export class WalletMovement {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "int" })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "int" })
  matchId: number;

  @Column("varchar", { unique: true, length: 255 })
  idempotencyKey: string;

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
    transformer: ColumnNumericTransformer,
  })
  montoReservado: number;

  @Column({
    type: "enum",
    enum: MovementStatus,
    default: MovementStatus.PENDING,
  })
  status: MovementStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
