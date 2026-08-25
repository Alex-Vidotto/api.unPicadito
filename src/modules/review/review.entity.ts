import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity.js';
import { Sala } from '../sala/sala.entity.js';

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    estrellas: number; 

    @Column({ type: 'text', nullable: true })
    comentario: string; 

    @ManyToOne(() => Usuario, (user) => user.resenasEscritas, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'calificador_id' })
    calificador: Usuario;

    // Relación con el Calificado (Usuario)
    @ManyToOne(() => Usuario, (user) => user.resenasRecibidas, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'calificado_id' })
    calificado: Usuario;

    @ManyToOne(() => Sala, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sala_id' })
    sala: Sala;

    @CreateDateColumn()
    createdAt: Date;
}
