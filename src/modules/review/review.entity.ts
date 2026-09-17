import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Sala } from '../sala/sala.entity';

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    estrellas: number;

    @Column({ type: 'text', nullable: true })
    comentario: string;

    @ManyToOne(() => User, (user) => user.resenasEscritas, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'calificador_id' })
    calificador: User;

    // Relación con el Calificado (User)
    @ManyToOne(() => User, (user) => user.resenasRecibidas, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'calificado_id' })
    calificado: User;

    @ManyToOne(() => Sala, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sala_id' })
    sala: Sala;

    @CreateDateColumn()
    creadoEn: Date;
}
